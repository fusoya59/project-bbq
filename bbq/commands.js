/// <reference path="components.js" />
/// <reference path="game.js" />
/// <reference path="algorithms.js" />
/// <reference path="map.js" />

/// <reference path="units.js" />

/// <reference path="../core/components.js" />
/// <reference path="../core/entitysystem.js" />
/// <reference path="../core/utils.js" />

if (!window.bbq) { window.bbq = {}; }
if (!bbq.systems) { bbq.systems = {}; }
if (!bbq.commands) { bbq.commands = {}; }

bbq.commands.endUnitTurn = function (unitEnt, em) {
    if (!em) { em = $em(); }
    boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
    boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'showCursor' }), em);
    boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: unitEnt } }), em);
}

bbq.commands.Train = function (em) {
    this.name = function () { return 'Train'; }
    this.execute = function (p) {
        var event = new bbq.events.TrainingEvent('show');
        event.entity = p.entity;
        boc.utils.createEvent(event, em);
        boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'hideCommands' }), em);
    };
};

bbq.commands.Cancel = function (em) {
    this.name = function () { return 'Cancel'; }
    this.execute = function (p) {
        // hide the ring view
    };
};

bbq.commands.Hold = function (em) {
    this.name = function () { return 'Hold'; }
    this.execute = function (p) {
        em.getComponentForEntity('Unit', p.entity).state = 'inactive';
        boc.utils.createEvent(
            new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: p.entity } }),
            em
        );
        boc.utils.createEvent(
            new bbq.events.MapSelectEvent({ action: 'unlockCursor' }),
            em
        );
        var mapEle = $em(p.entity).comp('MapElement');
        boc.utils.getCurrentPlayer().moves.push('(' + mapEle.x + ',' + mapEle.y + ')h');
        //boc.utils.createEvent(new bbq.events.SaveEvent('saveAll'), em);
    };
};
bbq.commands.Attack = function (em) {
    this.name = function () { return 'Attack'; }
    this.execute = function (p) {        
        boc.utils.createEvent(
            new bbq.events.CommandEvent({ action: 'attackMode', args : p }),
            em
        );
    };
    var _disabled = false;
    this.disabled = function (p) {
        if (p === true) {
            _disabled = true;
            return _disabled;
        }
        if (p === false) {
            _disabled = false;
            return _disabled;
        }
        return _disabled;
    }
};
bbq.commands.Move = function (em) {
    this.name = function () { return 'Move'; }
    this.execute = function (p) {        
        boc.utils.createEvent(
            new bbq.events.CommandEvent({ action: 'moveMode', args : p }),
            em
        );        
    };
    var _disabled = false;
    this.disabled = function (p) {
        if (p === true) {
            _disabled = true;
            return _disabled;
        }
        if (p === false) {
            _disabled = false;
            return _disabled;
        }
        return _disabled;
    }
};
bbq.commands.Gather = function (em) {
    this.name = function () { return 'Gather'; }
    this.execute = function (p) {
        // hide the ring view
        var entSpatial = $em(p.entity).comp('Spatial');
        var entMapElem = $em(p.entity).comp('MapElement');
        var entGather = $em(p.entity).comp('Gather');
        var gatherTarget = p.map.getEntities(entMapElem.x, entMapElem.y, 'Gatherable');
        if (gatherTarget && gatherTarget.length > 0 /*&& !entGather*/) {
            gatherTarget = gatherTarget[0];
        } else {
            return; // nothing to gather
        }
        if (!entGather) {
            var gatherIcon = $em.create('gatherIcon');
            $em(gatherIcon)
                .add(new boc.components.Spatial({ x: entSpatial.x, y: entSpatial.y + entSpatial.height - 15, z: bbq.zindex.UNITS + 1, width: 15, height: 15 }))
                .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('assets/Misc/icon_gather.png'), visible: true }));

            entSpatial._onGatherMoved = function () {
                $em(p.entity).remove('Gather');
            };
            entSpatial.addListener('onchange', entSpatial._onGatherMoved);

            $em(p.entity)
                .add(new bbq.components.Gather(gatherTarget, gatherIcon))
                .listen('onComponentRemoved', function (evArg) { // this is also invoked when entity is killed
                    if (evArg.componentName == 'Gather') {
                        if ($em(gatherIcon).exists()) {
                            $em(gatherIcon).kill();
                        }
                        entSpatial.removeListener('onchange', entSpatial._onGatherMoved);
                        delete entSpatial['_onGatherMoved'];
                    }
                });
        }
        if (!p.showIconOnly) {
            var gmap = $em(p.entity).comp('MapElement');
            boc.utils.getCurrentPlayer().moves.push('(' + gmap.x + ',' + gmap.y + ')g');
            //boc.utils.createEvent(new bbq.events.SaveEvent('saveAll'), em);
            bbq.commands.endUnitTurn(p.entity);
        }
    };

    var _disabled = false;
    this.disabled = function (p) {
        if (p === true) {
            _disabled = true;
            return _disabled;
        }
        if (p === false) {
            _disabled = false;
            return _disabled;
        }
        var mapElement = em.getComponentForEntity('MapElement', p.entity);        
        var propEnts = p.map.getEntities(mapElement.x, mapElement.y, 'Prop');
        for (var i = 0; i < propEnts.length; i++) {            
            if (em.getComponentForEntity('Prop', propEnts[i]).type == 'berries') {
                return _disabled;
            }
        }
        return true;
    } //disabled
};

bbq.commands.Capture = function (em) {
    this.name = function () { return 'Capture'; }
    this.execute = function (p) {
        // hide the ring view
        var entSpatial = $em(p.entity).comp('Spatial');
        var entMapElem = $em(p.entity).comp('MapElement');
        var entCapture = $em(p.entity).comp('Capture');
        var captureTarget = p.map.getEntities(entMapElem.x, entMapElem.y, 'Building');
        if (captureTarget && captureTarget.length > 0) {
            captureTarget = captureTarget[0];
        } else {
            //boc.utils.createEvent(
            //    new bbq.events.CommandEvent({ action: 'showCommands', args: { entity: p.entity } }),
            //    em
            //);
            return; // no building to capture
        }

        var building = $em(captureTarget).comp('Building');        
        if (!entCapture) {
            var captureIcon = $em.create('captureIcon');
            $em(captureIcon)
                .add(new boc.components.Spatial({ x: entSpatial.x, y: entSpatial.y + entSpatial.height - 15, z: bbq.zindex.UNITS + 1, width: 15, height: 15 }))
                .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('assets/Misc/icon_capture.png'), visible: true }));

            entSpatial._onCaptureMoved = function () {
                $em(p.entity).remove('Capture');
            };
            entSpatial.addListener('onchange', entSpatial._onCaptureMoved);

            $em(p.entity)
                .add(new bbq.components.Capture(captureTarget, captureIcon))
                .listen('onComponentRemoved', function (evArg) {
                    if (evArg.componentName == 'Capture') {
                        if ($em(captureIcon).exists()) {
                            $em(captureIcon).kill();
                        }
                        building.turnsUntilCapture = bbq.buildings.configuration[building.type].turnsTilCap;
                        entSpatial.removeListener('onchange', entSpatial._onCaptureMoved);
                        delete entSpatial['_onCaptureMoved'];
                    }
                });
        }
        
        if (building && !p.showIconOnly) {
            var capPoint = 1; // TODO: bonuses
            building.turnsUntilCapture -= capPoint;
            if (building.turnsUntilCapture <= 0) {                
                $em(entCapture.icon).kill();
                $em(p.entity).remove('Capture');
                building.turnsUntilCapture = bbq.buildings.configuration[building.type].turnsTilCap;
                //remove this from the opposing player
                $em('Player').each(function (e, c) {
                    if (c.hasEntity(captureTarget)) {
                        c.removeBuilding(captureTarget);
                    }
                });

                //add this to capturing player's buildings and recolor
                var currPlayer = boc.utils.getCurrentPlayer();
                currPlayer.addBuilding(captureTarget);
                $em(captureTarget).comp('DrawableSprite').image = boc.resources.GraphicsManager.getImage(bbq.buildings.configuration[building.type].defaultImagePath.replace('$(team)', currPlayer.team.toLowerCase()));

                // throw a victory event in case it was an HQ cap
                boc.utils.createEvent(new bbq.events.VictoryEvent('captureHQ', currPlayer.id), em);
            }
            var gmap = $em(p.entity).comp('MapElement');
            boc.utils.getCurrentPlayer().moves.push('(' + gmap.x + ',' + gmap.y + ')c');
            //boc.utils.createEvent(new bbq.events.SaveEvent('saveAll'), em);
            bbq.commands.endUnitTurn(p.entity);
        }        
    };

    var _disabled = false;
    this.disabled = function (p) {
        if (p === true) {
            _disabled = true;
            return _disabled;
        }
        if (p === false) {
            _disabled = false;
            return _disabled;
        }
        var mapElement = em.getComponentForEntity('MapElement', p.entity);
        var buildingEnts = p.map.getEntities(mapElement.x, mapElement.y, 'Building');
        var currentPlayer = boc.utils.getCurrentPlayer(em);
        var allPlayers = $em('Player').all();
        if (buildingEnts && buildingEnts.length > 0) { // enable if this building belongs to another player
            for (var i = 0; i < allPlayers.length; i++) {
                var otherPlayer = $em(allPlayers[i]).comp('Player');
                if (otherPlayer.id != currentPlayer.id) {
                    if (otherPlayer.buildings.indexOf(buildingEnts[0]) >= 0) {
                        return _disabled;
                    }
                }
            } //i
        }
        //if (currentPlayer) {
        //    for (var i = 0; i < buildingEnts.length; i++) {
        //        if (currentPlayer.units.indexOf(buildingEnts[i]) >= 0) {
        //            return _disabled;
        //        }
        //    } // i
        //}
        return true;
    }
};


bbq.systems.CommandSystem = function (em, canvas, map) {
    var context = canvas.getContext('2d');

    function endTurn(callback) {
        var currPlayer = boc.utils.getCurrentPlayer(em);
        currPlayer.updateTurn(currPlayer.turn + 1);
        currPlayer.upkeep = false;
        currPlayer.moves.push('e'); // end turn\
        //boc.utils.createEvent(new bbq.events.SaveEvent('saveAll', currPlayer.id), em);

        var allPlayers = em.getAllComponents('Player');

        // find the next player
        var nextTeamIndex = (bbq.teams.indexOf(currPlayer.team) + 1) % bbq.teams.length;
        var nextPlayer = null;
        while (!nextPlayer) {
            for (var j = 0; j < allPlayers.length; j++) {
                if (allPlayers[j].id == currPlayer.id) { continue; }
                if (allPlayers[j].team == bbq.teams[nextTeamIndex]) {
                    nextPlayer = allPlayers[j];
                }
            }
            nextTeamIndex = (nextTeamIndex + 1) % bbq.teams.length;
        }
        var turnEnt = em.getAllEntitiesWithComponent('Turn')[0];
        em.getComponentForEntity('Turn', turnEnt).playerid = nextPlayer.id;
        em.getComponentForEntity('Turn', turnEnt).number = nextPlayer.turn;

        //em.getComponentForEntity('Turn', turnEnt).update(nextPlayer.id, nextPlayer.turn);

        //// update the fog
        //boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
        //boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);

        // recolor the enemy units and activate my own
        for (var i = 0; i < allPlayers.length; i++) {
            for (var j = 0; j < allPlayers[i].units.length; j++) {
                var unit = em.getComponentForEntity('Unit', allPlayers[i].units[j]);
                em.getComponentForEntity('DrawableSprite', allPlayers[i].units[j]).image =
                    boc.resources.GraphicsManager.getImage(bbq.units.configuration[unit.type].defaultImagePath.replace('$(team)', allPlayers[i].team));
                if (allPlayers[i].id == nextPlayer.id) {
                    unit.state = 'idle';
                    // enable all commands again
                    var commands = em.getComponentForEntity('Commandable', allPlayers[i].units[j]).commands;
                    for (var k = 0; k < commands.length; k++) {
                        if (commands[k].disabled) { commands[k].disabled(false); }
                    } //k
                }
            } // j            
        } // i    

        boc.utils.createEvent(
            new bbq.events.SaveEvent(
                'saveAll',
                currPlayer.id,
                function () {
                    if (callback) {
                        callback();
                    }
                }),
                em
            );
    } // endTurn

    function createRingView(p) {
        
        var parentSpatial = p.spatial || em.getComponentForEntity('Spatial', p.entity);
        var commandable = em.getComponentForEntity('Commandable', p.entity);
        if (!commandable || !commandable.commands) { return; }

        var commands = commandable.commands.slice();
        for (var i = commands.length - 1; i >= 0; i--) {
            if (commands[i].disabled && commands[i].disabled({ entityManager: em, map: map, entity: p.entity })) {
                commands.splice(i, 1);
            }
        }
        // check stuff

        var ent = new boc.core.Entity({ entityManager: em });
        ent.addComponent(new boc.components.Spatial({
            x: parentSpatial.x + parentSpatial.width / 2,
            y: parentSpatial.y + parentSpatial.height / 2,
            z: bbq.zindex.UI,
            width: 1,
            height: 1
        }));
        ent.addComponent(new bbq.components.CommandRing());

        var positionmap = bbq.ui.configuration.ringPositions[commands.length - 1];

        var btnEnts = [];

        // for each button, calculate its position according to positionmap
        for (var i = 0; i < commands.length; i++) {
            var btnEnt = bbq.ui.createButton({ 
                entityManager: em, 
                context : context, 
                x: ent.Spatial.x, 
                y: ent.Spatial.y,
                text: commands[i].name(), 
                textFillStyle: 'white'
            });

            var btnSpatial = em.getComponentForEntity('Spatial', btnEnt);
            btnSpatial.update({ x: btnSpatial.x - btnSpatial.width / 2, y: btnSpatial.y - btnSpatial.height / 2 } );
            var dx = ent.Spatial.x + positionmap[i].offsetX - positionmap[i].anchorX * btnSpatial.width - btnSpatial.x;
            var dy = ent.Spatial.y + positionmap[i].offsetY - positionmap[i].anchorY * btnSpatial.height - btnSpatial.y;
            em.addComponentToEntity(
                new boc.components.Animation({                    
                    duration: 150,
                    easing: 'easeOutCubic',
                    componentName: 'Spatial',
                    propertyDeltas: { x: dx, y: dy },
                    state : boc.constants.ANIMATION_PLAYING 
                }),
                btnEnt
            );

            
            //var newX = ent.Spatial.x + positionmap[i].offsetX - positionmap[i].anchorX * btnSpatial.width;
            //var newY = ent.Spatial.y + positionmap[i].offsetY - positionmap[i].anchorY * btnSpatial.height;

            //btnSpatial.update({ x: newX, y: newY });
            btnEnts.push(btnEnt);

            // arm the button
            (function (btn, cmd) {
                em.getComponentForEntity('UIElement', btn).onclick = function () {
                    boc.utils.createEvent(
                        new bbq.events.CommandEvent({ action: 'hideCommands' }),
                        em
                    );
                    boc.utils.createEvent(
                        new bbq.events.MapSelectEvent({ action: 'lockCursor' }),
                        em
                    );
                    cmd.execute({ entity: p.entity, map : map, sender: btn });
                };
            })(btnEnt, commands[i]);
        }

        ent.addListener('onKill', function () {
            for(var i = 0; i < btnEnts.length; i++) {
                em.killEntity(btnEnts[i]);
            }
        });
        return ent.id();
    } // createRingView
  
    var forPlayer = null;
    this.processTick = function (frameTime) {
        var commandEventEnts = em.getAllEntitiesWithComponent('CommandEvent');
        for (var i = 0; i < commandEventEnts.length; i++) {
            var commandEventEnt = commandEventEnts[i];
            var commandEvent = em.getComponentForEntity('CommandEvent', commandEventEnt);

            var commandsLocked = forPlayer != null && boc.utils.getCurrentPlayer(em) != forPlayer;
            if (commandEvent.action == 'lockCommands') {
                forPlayer = commandEvent.args ? commandEvent.args.forPlayer : null;
            }
            else if (!commandsLocked && commandEvent.action == 'showCommands') {
                // remove any commands previously shown
                var commandRings = em.getAllEntitiesWithComponent('CommandRing');
                if (commandRings) {
                    commandRings = commandRings.slice();
                    while (commandRings.length > 0) {
                        em.killEntity(commandRings.pop());
                    }
                }
                if (commandEvent.args.entity && boc.utils.getCurrentPlayer(em).hasEntity(commandEvent.args.entity)) {
                    commandEvent.args.map = map;
                    createRingView(commandEvent.args);
                }
            }
            else if (!commandsLocked && commandEvent.action == 'hideCommands') {
                // remove any commands previously shown
                var commandRings = em.getAllEntitiesWithComponent('CommandRing');
                if (commandRings) {
                    commandRings = commandRings.slice();
                    while (commandRings.length > 0) {
                        em.killEntity(commandRings.pop());
                    }
                }
            }
            else if (!commandsLocked && commandEvent.action == 'endTurn') {
                endTurn(commandEvent.args.callback);
            }
            boc.utils.consumeEvent(commandEventEnt, 'CommandEvent', em);
        } // i

    }; // processTick
}; //CommandSystem 

bbq.systems.MoveSystem = function (em, map) {
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
            var prevArrow = { up: 0, down: 0, left: 0, right: 0, x : startSpatial.x, y : startSpatial.y };
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
                var e = new boc.core.Entity({entityManager : em });
                e.addComponent(new boc.components.Spatial({ x : arrow.x, y : arrow.y, z : bbq.zindex.UI - 1, width : map.tileWidth(), height : map.tileHeight() }));
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
            height:map.tileHeight()
        })
    );
    moveArrowEntity.addComponent(new boc.components.DrawableRect({ fillStyle: 'rgba(0,0,255,0.35)', lineWidth: 0, visible: false }));
    boc.utils.createBlinkingAnimation(moveArrowEntity, { easing : 'easeInCubic', drawableName : 'DrawableRect' }).start();
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
                image : boc.resources.GraphicsManager.getImage('assets/Misc/arrowbutton_' + dirs[i] + '.png'),
                visible : false
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

    function handleMove(idEnts) {
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
                showMoveOverlay(movingEntity);
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
                state = 'movingEntity';
                var animations = [];
                for (var i = 1; i < pathAnchorComp.path.length; i++) {
                    var dx = 0, dy = 0;
                    var currTile = boc.utils.toTile(pathAnchorComp.path[i]);
                    var prevTile = boc.utils.toTile(pathAnchorComp.path[i - 1]);
                    dx = (currTile.x - prevTile.x) * map.tileWidth();
                    dy = (currTile.y - prevTile.y) * map.tileHeight();
                    animations.push(new boc.components.Animation({
                        duration: em.getComponentForEntity('Movement', movingEntity).velocity,
                        easing: 'linearTween',
                        componentName: 'Spatial',
                        propertyDeltas: { x: dx, y: dy }
                    }));
                } //i

                var moveEventId = boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'moveEntity', args: { player: boc.utils.getCurrentPlayer(), entity: movingEntity } }), em);
                console.log(movingEntity);

                var anim = new boc.utils.AnimationSequence({
                    entity: movingEntity,
                    entityManager: em,                    
                    loop : false,
                    animations: animations,
                    onLoopComplete: function () {
                        var newTile = map.getTile(movingEntity);                        
                        map.place(movingEntity, newTile.x, newTile.y);
                        boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'showCursor' }));
                        boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'moveCursor', args: { entity: movingEntity }}));
                        boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'select', args: { selected: movingEntity, previous: movingEntity } }));
                        boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
                        boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
                        var commands = em.getComponentForEntity('Commandable', movingEntity).commands;
                        for (var i = 0; i < commands.length; i++) {
                            if (commands[i].name() == 'Move') {
                                commands[i].disabled(true);
                            }
                        } //i
                        state = 'wait';
                        if ($em(movingEntity).comp('SpriteAnimation')) {
                            $em(movingEntity).comp('SpriteAnimation').state = boc.constants.ANIMATION_STOPPED;
                        }
                        $em(movingEntity).comp('Unit').state = 'hasMoved';

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
                        console.log('consuming event');
                        boc.utils.consumeEvent(moveEventId, 'UnitEvent', em);
                    }
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

    function showMoveOverlay(entity) {
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
                    path : pathAnchor.path
                });

                startCell = pathAnchor.path[pathAnchor.path.length - 1].split(',');
                startCell = { x: +startCell[0], y: +startCell[1] };
            }
        } catch (err) {
            console.log('path anchor not found.');// ignore
        }

        var tiles = bbq.utils.getTilesWithinMoveRange({
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
                    boc.utils.createEvent(
                        new bbq.events.CommandEvent({ action: 'showCommands', args: { entity : movingEntity } }),
                        em
                    );
                    movingEntity = null;
                    state = 'wait';
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
                showMoveOverlay(p.entity);
                state = 'moveMode'
                movingEntity = p.entity;
                var moveSpatial = em.getComponentForEntity('Spatial', movingEntity);
                moveArrowEntity.Spatial.update({ x: moveSpatial.x, y: moveSpatial.y });
                moveArrowEntity.show();
                var pathAnchor = new boc.core.Entity({ entityManager: em });
                pathAnchor.addComponent(new bbq.components.PathAnchor());
                pathAnchor.PathAnchor.path.push(boc.utils.toTileKey(em.getComponentForEntity('MapElement', movingEntity)));                
                pathAnchor.addComponent(new boc.components.Spatial({ x:moveSpatial.x, y:moveSpatial.y, z:bbq.zindex.UI, width: moveSpatial.width, height:moveSpatial.height }));
            } // if moveMode
        } // i

        // hide the ring view
        
    };
}; //MoveSystem

bbq.systems.AttackSystem = function (em, map) {
    var state = 'wait'; // wait, attackMode, retliateMode, cleanup
    var attacker = null; // entity
    var opposer = null; // entity

    function reset() {
        state = 'wait';
        attacker = null;
        opposer = null;
    }

    function clearAttackOverlay() {
        var attackOverlays = $em('AttackOverlay').all().slice();
        for (var i = 0; i < attackOverlays.length; i++) {
            em.killEntity(attackOverlays[i]);
        }
    } //clearAttackOverlay

    function showAttackOverlay(entity) {
        var tiles = bbq.utils.getTilesWithinAttackRange({
            entityManager: em,
            entity: entity,
            costMap: map.costMap(),
            costNodes: map.attackMap(),
            sizeX: map.numColumns(),
            sizeY: map.numRows(),
            rangeOffset: 0
        });

        for (var j = 0; j < tiles.length; j++) {
            var tile = tiles[j].split(',');
            var attackTile = new boc.core.Entity({ entityManager: em });
            attackTile.addComponent(
                new boc.components.Spatial({
                    x: 0,
                    y: 0,
                    z: bbq.zindex.OVERLAY,
                    width: map.tileWidth(),
                    height: map.tileHeight()
                })
            );
            attackTile.addComponent(
                new boc.components.DrawableRect({
                    fillStyle: 'rgba(255,0,0,0.25)',
                    lineWidth: 0
                })
            );
            attackTile.addComponent(new bbq.components.AttackOverlay());
            attackTile.addComponent(new boc.components.Identifiable());
            map.place(attackTile.id(), +tile[0], +tile[1]);

            $em('Player').each(function(pe, pc) {
                if (pc.id === boc.utils.getCurrentPlayer(em).id) { return; }
                var unitOnTile = map.getEntities(+tile[0], +tile[1], 'Unit')[0];
                if (unitOnTile && pc.hasEntity(unitOnTile) && $em(unitOnTile).comp('DrawableSprite').visible) {
                    attackTile.AttackOverlay.target = unitOnTile;

                    var blinkingRect = $em.create();
                    $em(blinkingRect)
                        .add(new boc.components.Spatial({ x: 0, y: 0, z: bbq.zindex.OVERLAY + 1, width: map.tileWidth(), height: map.tileHeight() }))
                        .add(new boc.components.DrawableRect({ fillStyle: 'rgba(255,0,0,0.35)', lineWidth: 0, visible: true }))
                        .add(new bbq.components.AttackOverlay());
                    boc.utils.createBlinkingAnimation(blinkingRect, { easing: 'easeInCubic', drawableName: 'DrawableRect', delta: 1.0 }).start();
                    map.place(blinkingRect, +tile[0], +tile[1]);                    
                }
            });            
        } // j
    }

    function attackHit(src, dst, dmg, delay, onHit) {
        $em($em.create())
                .add(
                    new boc.components.DelayedMethod(function () {
                        var targetSpatial = $em(dst).comp('Spatial');
                        boc.utils.createHitEffect(targetSpatial.x, targetSpatial.y, em);
                        boc.utils.createBouncingText(dmg, targetSpatial.x + targetSpatial.width / 2 - 2, targetSpatial.y + targetSpatial.height - 6, { fillStyle: 'white', z: bbq.zindex.EFFECTS + 1 });
                        
                        
                        var dstHealth = $em(dst).comp('Health');
                        dstHealth.current -= dmg;
                        var dstPlayer = null, srcPlayer = null;
                        $em('Player').each(function (e, c) {
                            if (c.hasEntity(src)) {
                                srcPlayer = c;
                            }
                            if (c.hasEntity(dst)) {
                                dstPlayer = c;
                            }
                        });
                        if (dstHealth.current <= 0) {
                            var srcKills = srcPlayer.summary.unitsKilled || 0;
                            var dstLost = dstPlayer.summary.unitsLost || 0;
                            srcPlayer.updateSummary({ unitsKilled: srcKills + 1 });
                            dstPlayer.updateSummary({ unitsLost: dstLost + 1 });
                            $em(src).comp('Unit').kills++;
                            var level = bbq.units.getLevel(src);
                            if (level > $em(src).comp('Unit').level) {
                                bbq.units.levelUp(src, level, false);
                            }
                        }

                        if (onHit) { onHit(); }
                    },
                    delay)
                 );
    }

    function attackRoutine(src, dst, dmg, onAttackEnd) {
        if ($em(src).comp('SpriteAnimation')) {
            $em(src).comp('SpriteAnimation').state = boc.constants.ANIMATION_STOPPED;
        }
        var animationSet = $em(src).comp('SpriteAnimationSet');
        var attackAnim = null;
        if (animationSet && animationSet['attack']) {
            attackAnim = new boc.utils.SpriteAnimationSequence({
                entity: src,
                entityManager: em,
                loop: false,
                onLoopComplete: onAttackEnd,
                animations: [
                    animationSet['attack']
                ]
            }).start();
        }

        var unit = $em(src).comp('Unit');
        //var dmg = $em(src).comp('Attack').damage; // TODO: bonuses

        if (unit.type === 'SpearWarrior') {
            var hitTime = bbq.units.configuration[unit.type].animationSets.attack.hitTime;
            attackHit(src, dst, dmg, hitTime);
        }
        else if (unit.type === 'Catapult') {
            function onRockHit(p) {
                var animEnt = p.entity;
                $em(animEnt).remove('ParabolicTranslationAnimation');
                $em(rock).kill();
                attackHit(src, dst, dmg, 0);
            }

            var srcSpatial = $em(src).comp('Spatial'),
                dstSpatial = $em(dst).comp('Spatial');
            var dx = dstSpatial.x - srcSpatial.x,
                dy = dstSpatial.y - srcSpatial.y;
            var mag = Math.sqrt(dx * dx + dy * dy);
            var speed = 300;

            var rock = $em.create();
            var anim = new bbq.components.ParabolicTranslationAnimation({
                dx: dx,
                dy: dy,
                easing: 'linearTween',
                duration: mag / speed * 1000,
                state: boc.constants.ANIMATION_STOPPED
            });
            anim.addListener('onComplete', onRockHit);

            $em(rock)
                .add(new boc.components.Spatial({
                    x: srcSpatial.x + srcSpatial.width / 2 - 6, // center of rock
                    y: srcSpatial.y + srcSpatial.height / 2 - 6,
                    z: srcSpatial.z + 1,
                    width: 13,
                    height: 13
                }))
                .add(new boc.components.DrawableSprite({ image : boc.resources.GraphicsManager.getImage('assets/Projectiles/rock.png'), visible : false }))
                .add(anim);
            
            $em($em.create())
                .add(new boc.components.DelayedMethod(
                    function () {
                        $em(rock).comp('ParabolicTranslationAnimation').state = boc.constants.ANIMATION_PLAYING;
                        $em(rock).comp('DrawableSprite').visible = true;
                    },
                    900));
        }
        else if (unit.type === 'DartBlower') {
            function onDartHit(p) {
                var animEnt = p.entity;
                $em(animEnt).remove('Animation');
                $em(dart).kill();
                attackHit(src, dst, dmg, 0);
            }            
            var dart = $em.create();
            
            var srcSpatial = $em(src).comp('Spatial'),
                dstSpatial = $em(dst).comp('Spatial');
            var dx = dstSpatial.x - srcSpatial.x,
                dy = dstSpatial.y - srcSpatial.y;
            var angleRad = -Math.atan2(dx, dy);
            var mag = Math.sqrt(dx * dx + dy * dy);
            var speed = 300; // px per sec

            var anim = new boc.components.Animation({
                componentName: 'Spatial',
                propertyDeltas: { x: dx, y: dy },
                easing : 'linearTween',
                duration: mag / speed * 1000,
                state : boc.constants.ANIMATION_PLAYING
            });
            anim.addListener('onComplete', onDartHit);

            $em(dart)
                .add(new boc.components.Spatial({
                    x: srcSpatial.x + srcSpatial.width / 2 - 6, // center of the src 
                    y: srcSpatial.y + srcSpatial.height / 2 - 12,
                    z: Math.max(srcSpatial.z, dstSpatial.z) + 1,
                    angle : angleRad,
                    width: 12,
                    height: 23
                }))
                .add(new boc.components.DrawableSprite({
                    image: boc.resources.GraphicsManager.getImage('assets/Projectiles/dart.png'),
                    visible: true
                }))
                .add(anim);

        }
        else { // some crappy default attack routine
            attackHit(src, dst, dmg, 500);
        }
    }

    // returns true if attacking
    function handleAttack(idEnts) {        
        var attackTile = null;
        for (var i = 0; i < idEnts.length; i++) {
            attackTile = $em(idEnts[i]).comp('AttackOverlay');
            if (attackTile) { break; }
        }

        if (attackTile && attackTile.target) {            
            clearAttackOverlay();
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'hideCursor' }));
            //boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }));            
            opposer = attackTile.target;
            var dmg = $em(attacker).comp('Attack').damage; // TODO: bonuses
            attackRoutine(attacker, opposer, dmg, function () {
                state = 'retaliateMode';
            });            
            return true;
        } // click target
        return false;
    }

    // returns true if retaliating
    function handleRetaliate() {
        var canRetaliate = false;
        $em('Player').each(function (e, c) {
            // can the opposing player see you ?
            // is the attacker in range ?
            if ($em(opposer).exists() && c.hasEntity(opposer)) { // player has this unit...
                var tileKey = boc.utils.toTileKey($em(attacker).comp('MapElement'));
                var opposerTileRange = bbq.utils.getTilesWithinAttackRange({
                    entityManager: em,
                    entity: opposer,
                    costMap: map.costMap(),
                    costNodes: map.attackMap(),
                    sizeX: map.numColumns(),
                    sizeY: map.numRows(),
                    rangeOffset: 0
                });

                if (c.visibleMapTiles.indexOf(tileKey) >= 0 && opposerTileRange.indexOf(tileKey) >= 0) {
                    var dmg = Math.floor($em(opposer).comp('Retaliate').damage);
                    attackRoutine(opposer, attacker, dmg, function () {
                        state = 'cleanup';
                    });
                    canRetaliate = true;
                }                
            }            
        });
        if (canRetaliate) {
            state = 'retaliating';            
        }
        else {
            state = 'cleanup';
        }
        return canRetaliate;
    }
    

    this.processTick = function (frameTime) {
        $em('CommandEvent').each(function (e, c) {
            if (c.action === 'attackMode') {
                state = 'attackMode';
                attacker = c.args.entity;
                showAttackOverlay(attacker);
            }
            //event should already be consumed
        }); //each

        if (state === 'attackMode') {
            $em('IdentifyEvent').each(function (e, c) {
                // find the cursor
                var cursorEnt = null;
                for (var j = 0; j < c.identifiedEntities.length; j++) {
                    if ($em(c.identifiedEntities[j]).comp('Cursor')) {
                        cursorEnt = c.identifiedEntities[j];
                        break;
                    }                    
                } //j

                if (cursorEnt) { // i've clicked the cursor, return to previous state                    
                    if ($em(attacker).comp('Unit').state == 'idle') {
                        boc.utils.createEvent(
                            new bbq.events.MapSelectEvent({ action: 'unlockCursor' }),
                            em
                        );
                    }
                    boc.utils.createEvent(
                        new bbq.events.CommandEvent({ action: 'showCommands', args: { entity: attacker } }),
                        em
                    );
                    clearAttackOverlay();
                    reset();                    
                }
                else {
                    //actually attack
                    if (handleAttack(c.identifiedEntities)) {                        
                        var currPlayer = boc.utils.getCurrentPlayer();
                        var a = $em(attacker).comp('MapElement'), // attacker
                            o = $em(opposer).comp('MapElement');
                        currPlayer.moves.push('(' + a.x + ',' + a.y + ')a(' + o.x + ',' + o.y + ')');
                    }
                }
                boc.utils.consumeEvent(e, c.className(), em);
            });
        } // attackMode
        else if (state === 'retaliateMode') {
            if (handleRetaliate()) {                
                var currPlayer = boc.utils.getCurrentPlayer();
                var a = $em(attacker).comp('MapElement'), // attacker
                    o = $em(opposer).comp('MapElement'); // opposer
                currPlayer.moves.push('(' + o.x + ',' + o.y + ')r(' + a.x + ',' + a.y + ')');
            }
        }
        else if (state === 'cleanup') {            
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'showCursor' }), em);
            boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: attacker } }), em);
            //$em(attacker).comp('Unit').state = 'inactive';
            reset();
            state = 'wait';
        }
    }; // processTick
};//AttackSystem