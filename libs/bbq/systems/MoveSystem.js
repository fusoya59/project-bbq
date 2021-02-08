ns('bbq.systems');
bbq.systems.MoveSystem = function (em, map) {
	var _this = this;
    var state = 'wait'; // wait, moveMode, moveModal    

    var pathArrowDirections = ['up', 'down', 'right', 'left', 'hori', 'vert', 'upleft', 'upright', 'downleft', 'downright'];
    var pathArrowImages = {};
    for (var i = 0; i < pathArrowDirections.length; i++) {
        pathArrowImages[pathArrowDirections[i]] = boc.resources.GraphicsManager.getImage('assets/Misc/arrow_' + pathArrowDirections[i] + '.png');
    } //i

    function clearPath() {
        //var pathArrowAnchor = em.getAllEntitiesWithComponent('PathAnchor');
        //if (pathArrowAnchor) { pathArrowAnchor = pathArrowAnchor[0]; }
        var pathArrows = em.getAllEntitiesWithComponent('PathArrow').slice();
        while (pathArrows.length > 0) {
            em.killEntity(pathArrows.pop());
        }
        //map.refresh(boc.utils.getCurrentPlayer(em).units);
    }// clearPath

    function drawPath(startingEnt, pathArr) { // headings, up, down, left, right, or tileKeys "x,y"
        function getArrowImage(arrow) {
            if (arrow.up == 11 || arrow.down == 11)
                return pathArrowImages.vert;

            if (arrow.left == 11 || arrow.right == 11)
                return pathArrowImages.hori;

            if (arrow.up == 10) {
                if (arrow.left == 1)
                    return pathArrowImages.upleft;
                if (arrow.right == 1)
                    return pathArrowImages.upright;
                return pathArrowImages.up;
            }

            if (arrow.down == 10) {
                if (arrow.left == 1)
                    return pathArrowImages.downleft;
                if (arrow.right == 1)
                    return pathArrowImages.downright;
                return pathArrowImages.down;
            }

            if (arrow.left == 10) {
                if (arrow.up == 1)
                    return pathArrowImages.downright;
                if (arrow.down == 1)
                    return pathArrowImages.upright;
                return pathArrowImages.left;
            }

            if (arrow.right == 10) {
                if (arrow.up == 1)
                    return pathArrowImages.downleft;
                if (arrow.down == 1)
                    return pathArrowImages.upleft;
                return pathArrowImages.right;
            }

            return null;
        } // getArrowImage

        if (pathArr.length > 0) {
            // peek, what kind of array it is
            if (/\d+,\d+/.test(pathArr[0])) {
                // convert it to heading array
                var newArr = [];
                for (var i = 1; i < pathArr.length; i++) {
                    var xyCurr = pathArr[i].split(',');
                    var xyPrev = pathArr[i - 1].split(',');
                    if (+xyCurr[1] > +xyPrev[1]) { newArr.push('down'); }
                    else if (+xyCurr[1] < +xyPrev[1]) { newArr.push('up'); }
                    else if (+xyCurr[0] > +xyPrev[0]) { newArr.push('right'); }
                    else if (+xyCurr[0] < +xyPrev[0]) { newArr.push('left'); }
                } //i
                pathArr = newArr;
            } // if tileKeys

            var startSpatial = em.getComponentForEntity('Spatial', startingEnt);
            var prevArrow = { up: 0, down: 0, left: 0, right: 0, x: startSpatial.x, y: startSpatial.y };
            var arrows = [];
            for (var i = 0; i < pathArr.length; i++) {
                var direction = pathArr[i];
                var currArrow = { up: 0, down: 0, left: 0, right: 0, x: prevArrow.x, y: prevArrow.y };

                if (direction == 'up') { currArrow.y -= map.tileHeight(); }
                else if (direction == 'down') { currArrow.y += map.tileHeight(); }
                else if (direction == 'right') { currArrow.x += map.tileWidth(); }
                else if (direction == 'left') { currArrow.x -= map.tileWidth(); }

                arrows.push(currArrow);
                prevArrow[direction] += 1;
                currArrow[direction] += 10;
                prevArrow = currArrow;
            } //i

            for (var i = 0; i < arrows.length; i++) {
                var arrow = arrows[i];
                var e = new boc.core.Entity({ entityManager: em });
                e.addComponent(new boc.components.Spatial({ x: arrow.x, y: arrow.y, z: bbq.zindex.UI - 1, width: map.tileWidth(), height: map.tileHeight() }));
                e.addComponent(new boc.components.DrawableSprite({ image: getArrowImage(arrow), visible: true }));
                e.addComponent(new bbq.components.PathArrow());
                //e.addComponent(new bbq.components.MoveCostNode(function () { return 99999; }));
                //var mapTile = map.getTile(e);
                //map.place(e.id(), mapTile.x, mapTile.y);
            } // for i
            //var exclude = boc.utils.getCurrentPlayer(em).units.splice();
            //if (movingEntity) {
            //    var movingIndex = exclude.indexOf(movingEntity);
            //    if (movingIndex >= 0) {
            //        exclude.splice(movingIndex, 1);
            //    }
            //}
            //map.refresh(exclude);
        }
    }//drawPath

    var movingEntity = null;

    // creates the move arrow, bells and whistles and all
    var moveArrowEntity = new boc.core.Entity({ description: 'moveArrow', entityManager: em });
    moveArrowEntity.addComponent(
        new boc.components.Spatial({
            x: 0,
            y: 0,
            z: bbq.zindex.UI,
            width: map.tileWidth(),
            height: map.tileHeight()
        })
    );
    moveArrowEntity.addComponent(new boc.components.DrawableRect({ fillStyle: 'rgba(0,0,255,0.35)', lineWidth: 0, visible: false }));
    boc.utils.createBlinkingAnimation(moveArrowEntity, { easing: 'easeInCubic', drawableName: 'DrawableRect' }).start();
    moveArrowEntity.arrows = [];
    moveArrowEntity.hide = function () {
        this.DrawableRect.visible = false;
        for (var i = 0; i < this.arrows.length; i++) {
            this.arrows[i].DrawableSprite.visible = false;
        }
    };
    moveArrowEntity.show = function () {
        this.DrawableRect.visible = true;
        for (var i = 0; i < this.arrows.length; i++) {
            this.arrows[i].DrawableSprite.visible =
                this.arrows[i].Spatial.x >= 0 && this.arrows[i].Spatial.x < map.width() &&
                this.arrows[i].Spatial.y >= 0 && this.arrows[i].Spatial.y < map.height();
        }
    };

    // direction, xoffset, yoffset
    var dirs = ['right', map.tileWidth(), 0,
                'down', 0, map.tileHeight(),
                'left', -map.tileWidth(), 0,
                'up', 0, -map.tileHeight()];

    for (var i = 0; i < dirs.length; i += 3) {
        var arrow = new boc.core.Entity({ description: 'moveArrow_' + dirs[i], entityManager: em });
        arrow.addComponent(
            new boc.components.Spatial({
                x: moveArrowEntity.Spatial.x + dirs[i + 1],
                y: moveArrowEntity.Spatial.y + dirs[i + 2],
                z: moveArrowEntity.Spatial.z,
                width: moveArrowEntity.Spatial.width,
                height: moveArrowEntity.Spatial.height
            })
        );
        arrow.addComponent(
            new boc.components.DrawableSprite({
                image: boc.resources.GraphicsManager.getImage('assets/Misc/arrowbutton_' + dirs[i] + '.png'),
                visible: false
            })
        );
        arrow.addComponent(new boc.components.Identifiable({}));
        arrow.addComponent(new bbq.components.MoveArrow(dirs[i]));
        moveArrowEntity.arrows.push(arrow);
        boc.utils.follow(moveArrowEntity.id(), arrow.id(), em);
    } //i

    function clearMoveOverlay() {
        var moveOverlay = em.getAllEntitiesWithComponent('MoveOverlay').slice();
        while (moveOverlay.length > 0) {
            em.killEntity(moveOverlay.pop());
        }
    }

    function actuallyMove(path, movingEntity, onMoveEnd) {
        state = 'movingEntity';
        var animations = [];        
        var totalTime = 250; // pad it a bit
        for (var i = 1; i < path.length; i++) {
            var dx = 0, dy = 0;
            var currTile = boc.utils.toTile(path[i]);
            var prevTile = boc.utils.toTile(path[i - 1]);
            dx = (currTile.x - prevTile.x) * map.tileWidth();
            dy = (currTile.y - prevTile.y) * map.tileHeight();
            var anim = new boc.components.Animation({
                duration: em.getComponentForEntity('Movement', movingEntity).velocity,
                easing: 'linearTween',
                componentName: 'Spatial',
                propertyDeltas: { x: dx, y: dy }
            });
            animations.push(anim);
            totalTime += em.getComponentForEntity('Movement', movingEntity).velocity;
        } //i


        var unitEvent = new bbq.events.UnitEvent({ action: 'moveEntity', args: { player: boc.utils.getCurrentPlayer(em), entity: movingEntity } });

        var moveEventId = boc.utils.createEvent(unitEvent, em, { duration: totalTime });        

        var anim = new boc.utils.AnimationSequence({
            entity: movingEntity,
            entityManager: em,
            loop: false,
            animations: animations,
            onLoopComplete: function () {
                var newTile = map.getTile(movingEntity);
                map.place(movingEntity, newTile.x, newTile.y);
                boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'showCursor' }), em);
                boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'moveCursor', args: { entity: movingEntity } }), em);
                boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'select', args: { selected: movingEntity, previous: movingEntity } }), em);
                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
                var commands = em.getComponentForEntity('Commandable', movingEntity).commands;
                console.log(commands);
				for (var i = 0; i < commands.length; i++) {
                    if (commands[i].name() == 'Move') {
                        commands[i].disabled(true);
                    }
                    if (commands[i].name() == 'Hold') {
                        commands[i].disabled(false);
                    }
                } //i
                state = 'wait';
                currentCommand = null;
                var animComp = $em(movingEntity).comp('SpriteAnimation') || $em(movingEntity).comp('SpineAnimation');
                if (animComp) {
                    animComp.state = boc.constants.ANIMATION_STOPPED;
                }
                $em(movingEntity).comp('Unit').state = 'hasMoved';

                if (!onMoveEnd) {
                    // idle animation
                    var animSet = $em(movingEntity).comp('SpriteAnimationSet');
                    if (animSet && animSet['idle']) {
                        var idleAnim = new boc.utils.SpriteAnimationSequence({
                            entity: movingEntity,
                            entityManager: em,
                            loop: true,
                            animations: [
                                selectedAnimationSetComp['idle']
                            ]
                        });
                        idleAnim.start();
                    }
			        var audio = bbq.sh().getAudio(movingEntity, 'unitWalk');
					bbq.sh().fadeOut(audio, 100, function(p) {
						console.log(p);
						bbq.sh().reset(p.audio)
					});
                } else {
                    onMoveEnd();
                }

                boc.utils.consumeEvent(moveEventId, 'UnitEvent', em);
            } // loopComplete                    
        }).start();

        // show walk animation
        if ($em(movingEntity).comp('SpriteAnimation')) { $em(movingEntity).comp('SpriteAnimation').state = boc.constants.ANIMATION_STOPPED; }
        var selectedAnimationSetComp = $em(movingEntity).comp('SpriteAnimationSet');
        if (selectedAnimationSetComp && selectedAnimationSetComp['walk']) {
            var walkAnim = new boc.utils.SpriteAnimationSequence({
                entity: movingEntity,
                entityManager: em,
                loop: true,
                animations: [
                    selectedAnimationSetComp['walk']
                ]
            });
            walkAnim.start();
        }
        var spineAnimation = em.getComponentForEntity('SpineAnimation', movingEntity);
        if (spineAnimation) {
            spineAnimation.state = boc.constants.ANIMATION_PLAYING;
            spineAnimation.animationState.setAnimationByName('move', true);
            spineAnimation._previousDrawable = spineAnimation._previousDrawable || em.getComponentForEntity('DrawableSprite', movingEntity);
            // store the previous drawable in the animation
            em.removeComponentFromEntity(spineAnimation._previousDrawable.className(), movingEntity);
        }
        var audio = bbq.sh().getAudio(movingEntity, 'unitWalk');
        if (audio) {
            bbq.sh().play(audio, true);
        }
    }

    function handleMove(idEnts, onMoveEnd) {
        var moveArrowEnt = null;
        var moveArrowComp = null;
        var pathAnchorEnt = em.getAllEntitiesWithComponent('PathAnchor')[0];
        var pathAnchorComp = em.getComponentForEntity('PathAnchor', pathAnchorEnt);
        var moveOverlayEnt = null;
        var moveOverlayComp = null;
        var moveString = null;
        for (var i = 0; i < idEnts.length; i++) {
            moveArrowComp = em.getComponentForEntity('MoveArrow', idEnts[i]);
            if (moveArrowComp) {
                moveArrowEnt = idEnts[i];
                break;
            }
            moveOverlayComp = em.getComponentForEntity('MoveOverlay', idEnts[i]);
            if (moveOverlayComp) {
                moveOverlayEnt = idEnts[i];
                break;
            }
        } //i

        if (moveArrowComp) { // clicked on a move arrow
            // check first if we've clicked a previous tile            

            var moveArrowTile = map.getTile(moveArrowEnt);
            var moveOverlays = map.getEntities(moveArrowTile.x, moveArrowTile.y, 'MoveOverlay');

            var clickedPrevious = false;
            if (pathAnchorComp && pathAnchorComp.path.length > 1 && pathAnchorComp.path[pathAnchorComp.path.length - 2] == boc.utils.toTileKey(moveArrowTile)) {
                pathAnchorComp.path.pop();
                clickedPrevious = true;
            }

            if (moveOverlays.length > 0 || clickedPrevious) { // make sure i've also clicked on a move overlay square

                if (moveArrowComp.heading == 'up') {
                    moveArrowEntity.Spatial.update({ y: moveArrowEntity.Spatial.y - map.tileHeight() });
                }
                else if (moveArrowComp.heading == 'down') {
                    moveArrowEntity.Spatial.update({ y: moveArrowEntity.Spatial.y + map.tileHeight() });
                }
                else if (moveArrowComp.heading == 'left') {
                    moveArrowEntity.Spatial.update({ x: moveArrowEntity.Spatial.x - map.tileWidth() });

                }
                else if (moveArrowComp.heading == 'right') {
                    moveArrowEntity.Spatial.update({ x: moveArrowEntity.Spatial.x + map.tileWidth() });
                }
                moveArrowTile = map.getTile(moveArrowEntity.id());
                var unitsOnTile = map.getEntities(moveArrowTile.x, moveArrowTile.y, 'Unit');
                var unitOnTile = null;
                for (var j = 0; j < unitsOnTile.length; j++) {
                    if (em.getComponentForEntity('DrawableSprite', unitsOnTile[j]).visible) {
                        unitOnTile = unitsOnTile[j];
                        break;
                    }
                }
                if (unitOnTile) { moveArrowEntity.DrawableRect.fillStyle = 'rgba(255,0,0,0.3)'; }
                else { moveArrowEntity.DrawableRect.fillStyle = 'rgba(0,0,255,0.3)'; }


                // check previous. if it's the same tile, we pop it. otherwise we push.
                //if (pathAnchorComp.path.length > 1 && pathAnchorComp.path[pathAnchorComp.path.length - 2] == boc.utils.toTileKey(moveArrowTile)) {
                //    pathAnchorComp.path.pop();
                //}
                //else {
                if (!clickedPrevious) {
                    pathAnchorComp.path.push(boc.utils.toTileKey(moveArrowTile));
                }
                //}
                moveArrowEntity.show();
                clearPath();
                
                drawPath(pathAnchorEnt, pathAnchorComp.path);
                clearMoveOverlay();
                var meCmds = $em(movingEntity).comp('Commandable').commands;
                var moveTiles = null;                
                for (var c = 0; c < meCmds.length; c++) {
                	if (meCmds[c].name() === 'Move') {
                		moveTiles = meCmds[c].moveTiles; 
                	}
                }
                showMoveOverlay(movingEntity, moveTiles);
            } // clicked on a move overlay square            
        } // clicked on a moveArrow enttiy

        else if (moveOverlayComp) { // clicked on a valid move tile            

            clearPath();
            var startTile = map.getTile(moveArrowEntity);
            var endTile = map.getTile(moveOverlayEnt);

            // clicked the center. move the unit.
            var canMove = true;
            var unitOnTile = map.getEntities(endTile.x, endTile.y, 'Unit');
            if (unitOnTile && unitOnTile.length > 0) {
                unitOnTile = unitOnTile[0];
                canMove = !$em(unitOnTile).comp('DrawableSprite').visible;
            }

            if (startTile.x == endTile.x && startTile.y == endTile.y && canMove) {
                clearMoveOverlay();
                moveArrowEntity.hide();
                var pathAnchors = em.getAllEntitiesWithComponent('PathAnchor').slice();
                while (pathAnchors.length > 0) {
                    em.killEntity(pathAnchors.pop());
                }
                boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'hideCursor' }));
                //state = 'movingEntity';
                //var animations = [];
                ////var movementTiles = {
                ////    path: pathAnchorComp.path,
                ////    pindex: 1
                ////};
                //var totalTime = 250; // pad it a bit
                //for (var i = 1; i < pathAnchorComp.path.length; i++) {
                //    var dx = 0, dy = 0;
                //    var currTile = boc.utils.toTile(pathAnchorComp.path[i]);
                //    var prevTile = boc.utils.toTile(pathAnchorComp.path[i - 1]);
                //    dx = (currTile.x - prevTile.x) * map.tileWidth();
                //    dy = (currTile.y - prevTile.y) * map.tileHeight();
                //    var anim = new boc.components.Animation({
                //        duration: em.getComponentForEntity('Movement', movingEntity).velocity,
                //        easing: 'linearTween',
                //        componentName: 'Spatial',
                //        propertyDeltas: { x: dx, y: dy }
                //    });
                //    animations.push(anim);
                //    totalTime += em.getComponentForEntity('Movement', movingEntity).velocity;
                //} //i


                //var unitEvent = new bbq.events.UnitEvent({ action: 'moveEntity', args: { player: boc.utils.getCurrentPlayer(), entity: movingEntity } });
                ////console.log(movementTiles);
                ////unitEvent.movementTiles = movementTiles;

                //var moveEventId = boc.utils.createEvent(unitEvent, em, { duration: totalTime });
                //console.log(movingEntity);

                //var anim = new boc.utils.AnimationSequence({
                //    entity: movingEntity,
                //    entityManager: em,
                //    loop: false,
                //    animations: animations,
                //    onLoopComplete: function () {
                //        var newTile = map.getTile(movingEntity);
                //        map.place(movingEntity, newTile.x, newTile.y);
                //        boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'showCursor' }));
                //        boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'moveCursor', args: { entity: movingEntity } }));
                //        boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'select', args: { selected: movingEntity, previous: movingEntity } }));
                //        boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
                //        boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
                //        var commands = em.getComponentForEntity('Commandable', movingEntity).commands;
                //        for (var i = 0; i < commands.length; i++) {
                //            if (commands[i].name() == 'Move') {
                //                commands[i].disabled(true);
                //            }
                //        } //i
                //        state = 'wait';
                //        var animComp = $em(movingEntity).comp('SpriteAnimation') || $em(movingEntity).comp('SpineAnimation');
                //        if (animComp) {
                //            animComp.state = boc.constants.ANIMATION_STOPPED;
                //        }
                //        $em(movingEntity).comp('Unit').state = 'hasMoved';

                //        // idle animation
                //        var animSet = $em(movingEntity).comp('SpriteAnimationSet');
                //        if (animSet && animSet['idle']) {
                //            var idleAnim = new boc.utils.SpriteAnimationSequence({
                //                entity: movingEntity,
                //                entityManager: em,
                //                loop: true,
                //                animations: [
                //                    selectedAnimationSetComp['idle']
                //                ]
                //            });
                //            idleAnim.start();
                //        }
                        
                //        boc.utils.consumeEvent(moveEventId, 'UnitEvent', em);
                //    } // loopComplete                    
                //}).start();

                //// show walk animation
                //if ($em(movingEntity).comp('SpriteAnimation')) { $em(movingEntity).comp('SpriteAnimation').state = boc.constants.ANIMATION_STOPPED; }
                //var selectedAnimationSetComp = $em(movingEntity).comp('SpriteAnimationSet');
                //if (selectedAnimationSetComp && selectedAnimationSetComp['walk']) {
                //    var walkAnim = new boc.utils.SpriteAnimationSequence({
                //        entity: movingEntity,
                //        entityManager: em,
                //        loop: true,
                //        animations: [
                //            selectedAnimationSetComp['walk']
                //        ]
                //    });
                //    walkAnim.start();
                //}
                //var spineAnimation = em.getComponentForEntity('SpineAnimation', movingEntity);
                //if (spineAnimation) {
                //    spineAnimation.state = boc.constants.ANIMATION_PLAYING;
                //    spineAnimation.animationState.setAnimationByName('move', true);
                //    spineAnimation._previousDrawable = spineAnimation._previousDrawable || em.getComponentForEntity('DrawableSprite', movingEntity);
                //    // store the previous drawable in the animation
                //    em.removeComponentFromEntity(spineAnimation._previousDrawable.className(), movingEntity);
                //}

                actuallyMove(pathAnchorComp.path, movingEntity, currentCommand ? currentCommand.onMoveEnd : null);
                moveString = '';
                for (var i = 1; i < pathAnchorComp.path.length; i++) {
                    var currTile = boc.utils.toTile(pathAnchorComp.path[i]);
                    var prevTile = boc.utils.toTile(pathAnchorComp.path[i - 1]);
                    if (currTile.x > prevTile.x) { moveString += 'e'; }
                    if (currTile.x < prevTile.x) { moveString += 'w'; }
                    if (currTile.y > prevTile.y) { moveString += 's'; }
                    if (currTile.y < prevTile.y) { moveString += 'n'; }
                } //i
            }
            else {
                var currMoveCost = bbq.utils.getMoveCost({ entityManager: em, entity: movingEntity, costMap: map.costMap(), costNodes: map.movementMap(), path: pathAnchorComp.path });
                var tilePath = bbq.utils.findMovePath({
                    entityManager: em,
                    entity: movingEntity,
                    astarMap: map.astarMap(),
                    costNodes: map.movementMap(),
                    sizeX: map.numColumns(),
                    sizeY: map.numRows(),
                    rangeOffset: -currMoveCost,
                    startTile: startTile,
                    endTile: endTile,
                    excludeList: pathAnchorComp.path
                });
                //pathAnchorComp.path.concat(tilePath);
                for (var j = 0; j < tilePath.length; j++) {
                    if (pathAnchorComp.path.indexOf(tilePath[j]) == -1) {
                        pathAnchorComp.path.push(tilePath[j]);
                    }
                }//j

                var lastTile = pathAnchorComp.path[pathAnchorComp.path.length - 1].split(',');
                lastTile = { x: +lastTile[0], y: +lastTile[1] };

                moveArrowEntity.Spatial.update({
                    x: lastTile.x * map.tileWidth(),
                    y: lastTile.y * map.tileHeight()
                });

                var moveArrowTile = map.getTile(moveArrowEntity.id());
                var unitsOnTile = map.getEntities(moveArrowTile.x, moveArrowTile.y, 'Unit');
                var unitOnTile = null;
                for (var j = 0; j < unitsOnTile.length; j++) {
                    if (em.getComponentForEntity('DrawableSprite', unitsOnTile[j]).visible) {
                        unitOnTile = unitsOnTile[j];
                        break;
                    }
                }
                if (unitOnTile) { moveArrowEntity.DrawableRect.fillStyle = 'rgba(255,0,0,0.3)'; }
                else { moveArrowEntity.DrawableRect.fillStyle = 'rgba(0,0,255,0.3)'; }
                moveArrowEntity.show();

                drawPath(pathAnchorEnt, pathAnchorComp.path);
                clearMoveOverlay();
                showMoveOverlay(movingEntity);
            }
        }

        return moveString;
    } // handleMove

    function showMoveOverlay(entity, moveTiles) {
        var rangeOffset = 0;
        var startCell = null;

        var pathAnchor = null;
        try {
            pathAnchor = em.getAllComponents('PathAnchor');
            if (pathAnchor && pathAnchor.length > 0) {
                pathAnchor = pathAnchor[0];
                rangeOffset = -bbq.utils.getMoveCost({
                    entityManager: em,
                    entity: entity,
                    costMap: map.costMap(),
                    costNodes: map.movementMap(),
                    path: pathAnchor.path
                });

                startCell = pathAnchor.path[pathAnchor.path.length - 1].split(',');
                startCell = { x: +startCell[0], y: +startCell[1] };
            }
        } catch (err) {
            console.log('path anchor not found.', err);// ignore
        }

        var tiles = moveTiles || bbq.utils.getTilesWithinMoveRange({
            entityManager: em,
            entity: entity,
            costMap: map.costMap(),
            costNodes: map.movementMap(),
            sizeX: map.numColumns(),
            sizeY: map.numRows(),
            rangeOffset: rangeOffset,
            startCell: startCell,
            excludeList: pathAnchor ? pathAnchor.path : null
        });

        for (var j = 0; j < tiles.length; j++) {
            var tile = tiles[j].split(',');
            var moveTile = new boc.core.Entity({ entityManager: em });
            moveTile.addComponent(
                new boc.components.Spatial({
                    x: 0,
                    y: 0,
                    z: bbq.zindex.OVERLAY,
                    width: map.tileWidth(),
                    height: map.tileHeight()
                })
            );
            moveTile.addComponent(
                new boc.components.DrawableRect({
                    fillStyle: 'rgba(0,0,255,0.25)',
                    lineWidth: 0
                })
            );
            moveTile.addComponent(new bbq.components.MoveOverlay());
            moveTile.addComponent(new boc.components.Identifiable());
            map.place(moveTile.id(), +tile[0], +tile[1]);
        } // j
    }
    
    var currentCommand = null;
    this.processTick = function (frameTime) {
        if (state == 'moveMode') {
            var idEventEnts = em.getAllEntitiesWithComponent('IdentifyEvent');
            for (var i = 0; i < idEventEnts.length; i++) {
                var idEventEnt = idEventEnts[i];
                var idEvent = em.getComponentForEntity('IdentifyEvent', idEventEnt);

                // find the cursor
                var cursorEnt = null;
                for (var j = 0; j < idEvent.identifiedEntities.length; j++) {
                    if (em.getComponentForEntity('Cursor', idEvent.identifiedEntities[j])) {
                        cursorEnt = idEvent.identifiedEntities[j];
                        break;
                    }
                } //j

                if (cursorEnt) { // i've clicked the cursor, return to previous state
                    clearMoveOverlay();
                    boc.utils.createEvent(
                        new bbq.events.MapSelectEvent({ action: 'unlockCursor' }),
                        em
                    );
					var commands = em.getComponentForEntity('Commandable', movingEntity).commands;
					for (var c = 0; c < commands.length; c++) {
						if (commands[c].name() == 'Hold') {
							commands[c].disabled(true);
						}
					}
                    boc.utils.createEvent(
                        new bbq.events.CommandEvent({ action: 'showCommands', args: { entity: movingEntity } }),
                        em
                    );
                    movingEntity = null;
                    state = 'wait';
                    currentCommand = null;
                    moveArrowEntity.hide();
                    var pathAnchors = em.getAllEntitiesWithComponent('PathAnchor').slice();
                    while (pathAnchors.length > 0) {
                        em.killEntity(pathAnchors.pop());
                    }
                    clearPath();
                }
                else {
                    //actually move
                    var moveString = handleMove(idEvent.identifiedEntities);
                    if (moveString != null) {
                        var m = $em(movingEntity).comp('MapElement');
                        boc.utils.getCurrentPlayer().moves.push('(' + m.x + ',' + m.y + ')m(\'' + moveString + '\')');
                        // TODO: do something about moving, saving, then quitting
                        //boc.utils.createEvent(new bbq.events.SaveEvent('saveAll'), em);
                    }
                }
                boc.utils.consumeEvent(idEventEnt, 'IdentifyEvent', em);
            } // each event
        } // moveMode

        var commandEventEnts = em.getAllEntitiesWithComponent('CommandEvent');
        for (var i = 0; i < commandEventEnts.length; i++) {
            var commandEventEnt = commandEventEnts[i];
            var commandEvent = em.getComponentForEntity('CommandEvent', commandEventEnt);

            if (commandEvent.action == 'moveMode') {
                var p = commandEvent.args;
                showMoveOverlay(p.entity, p.command.moveTiles);
                state = 'moveMode'
                currentCommand = p.command;
                movingEntity = p.entity;
                var moveSpatial = em.getComponentForEntity('Spatial', movingEntity);
                moveArrowEntity.Spatial.update({ x: moveSpatial.x, y: moveSpatial.y });
                moveArrowEntity.show();
                var pathAnchor = new boc.core.Entity({ entityManager: em });
                pathAnchor.addComponent(new bbq.components.PathAnchor());
                pathAnchor.PathAnchor.path.push(boc.utils.toTileKey(em.getComponentForEntity('MapElement', movingEntity)));
                pathAnchor.addComponent(new boc.components.Spatial({ x: moveSpatial.x, y: moveSpatial.y, z: bbq.zindex.UI, width: moveSpatial.width, height: moveSpatial.height }));
                
            } // if moveMode
            else if (commandEvent.action == 'moveEntity') {
                var p = commandEvent.args;
                actuallyMove(p.path, p.entity, (p.onMoveEnd || p.command.onMoveEnd));
            }
        } // i

        // hide the ring view

    };
}; //MoveSystem