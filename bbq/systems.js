/// <reference path="components.js" />
/// <reference path="systems.js" />
/// <reference path="commands.js" />
/// <reference path="algorithms.js" />
/// <reference path="ui.js" />
/// <reference path="../core/pfx.js" />
/// <reference path="../core/components.js" />
/// <reference path="../core/entitysystem.js" />
/// <reference path="../core/systems.js" />
/// <reference path="../core/utils.js" />


if (!window.bbq) { window.bbq = {}; }
if (!bbq.systems) { bbq.systems = {}; }

bbq.systems.MapSelectSystem = function(em, camera) {
    var _cursor = new boc.core.Entity({ description: 'mapCursor' });
    _cursor.currentSelection = null;
    _cursor.previousSelection = null;
    _cursor.hide = false;
    _cursor.locked = false;
    _cursor.addComponent(
        new boc.components.Spatial({
            x: 0,
            y: 0,
            z: bbq.zindex.CURSOR,
            width: 50,
            height: 50        
        })
    );
    _cursor.addComponent(
        new boc.components.DrawableSprite({
            image : boc.resources.GraphicsManager.getImage('assets/Misc/select_cursor.png'),
            alpha : 1.0,
            visible : false
        })
    );
    _cursor.addComponent(
        new bbq.components.MapElement({
            x : 0,
            y : 0            
        })
    );
    _cursor.addComponent(new boc.components.Identifiable({}));
    _cursor.addComponent(new bbq.components.Cursor());
    _cursor.oldZ = null;
    
    // just cause i can!!    
    //_cursor.addComponent(
    //    new boc.pfx.components.Emitter({
    //        particleFactory: new boc.pfx.particleFactories.SmokeStarFactory(em, 20),
    //        startVector: {x : 0, y:-1 },
    //        startVelocity: 125, // pixels per sec
    //        accelerationVector : { x:0, y:0.025 },
    //        emitRadius : 30,
    //        particleDuration : 2500, // ms
    //        particlesPerSecond : 15
    //    })
    //);        
   
    var _cursorAlphas = [ 1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4 ];
    
    var _cursorSprites = [];
    for (var i = 0; i < _cursorAlphas.length; i++) {
        _cursorSprites.push(
            new boc.components.DrawableSprite({
                image : boc.resources.GraphicsManager.getImage('assets/Misc/select_cursor.png'),
                alpha : _cursorAlphas[i]                
            }) 
        );
    } // i
    for (var i = _cursorAlphas.length -1; i >= 0; i--) {
        _cursorSprites.push(
            new boc.components.DrawableSprite({
                image : boc.resources.GraphicsManager.getImage('assets/Misc/select_cursor.png'),
                alpha : _cursorAlphas[i]                
            }) 
        );
    } // i
    
    var _cursorAnim = new boc.utils.SpriteAnimationSequence({
        entityManager : em,
        entity : _cursor,
        loop : true,
        animations : [
            new boc.components.SpriteAnimation({
                sprites : _cursorSprites,
                duration : 1500,
                easing: 'linear'
            })
        ]
    });
    _cursorAnim.start();
    
    this.processTick = function (frameTime) {
        var mapSelectEventEnts = em.getAllEntitiesWithComponent('MapSelectEvent');
        
        for (var i = 0; i < mapSelectEventEnts.length; i++) {
            var mapSelectEvent = em.getComponentForEntity('MapSelectEvent', mapSelectEventEnts[i]);
            if (mapSelectEvent.action == 'hideCursor') {
                _cursor.hide = true;
                _cursor.DrawableSprite.visible = false;
            }
            else if (mapSelectEvent.action == 'showCursor') {
                _cursor.hide = false;
                _cursor.DrawableSprite.visible = true;
            }
            else if (mapSelectEvent.action == 'lockCursor') {
                _cursor.locked = true;
            }
            else if (mapSelectEvent.action == 'unlockCursor') {
                _cursor.locked = false;
            }
            else if (mapSelectEvent.action == 'moveCursor' && mapSelectEvent.args.entity) {
                var entSpatial = em.getComponentForEntity('Spatial', mapSelectEvent.args.entity);
                var entMapElement = em.getComponentForEntity('MapElement', mapSelectEvent.args.entity);
                _cursor.Spatial.update({
                    x: entSpatial.x + entSpatial.width - _cursor.Spatial.width,
                    y: entSpatial.y + entSpatial.height - _cursor.Spatial.height
                });
                _cursor.MapElement.x = entMapElement.x;
                _cursor.MapElement.y = entMapElement.y;
            }
            boc.utils.consumeEvent(mapSelectEventEnts[i], 'MapSelectEvent', em);
        } // i

        if (_cursor.locked) { return; }

        var identifyEvents = em.getAllEntitiesWithComponent('IdentifyEvent');
        
        for (var i = 0; i < identifyEvents.length; i++) {
            var idEventEnt = identifyEvents[i];
            var idEvent = em.getComponentForEntity('IdentifyEvent', idEventEnt);
            var sortedEnts = idEvent.identifiedEntities.slice()
                .sort(function(a,b) {
                    var spatialA = em.getComponentForEntity('Spatial', a);
                    var spatialB = em.getComponentForEntity('Spatial', b);
                    
                    if (!spatialA && !spatialB) { return 0; }
                    if (spatialA && !spatialB) { return 1; }
                    if (!spatialA && spatialB) { return -1; }
                    return spatialA.z - spatialB.z;
                });            
            
            var topEnt = sortedEnts.pop();
            var topMapElement = em.getComponentForEntity('MapElement', topEnt);
            var topDrawable = em.getComponentForEntity('DrawableSprite', topEnt);
            while (topEnt && (!topMapElement || !topDrawable.visible)) {
                topEnt = sortedEnts.pop();
                if (topEnt) {
                    topMapElement = em.getComponentForEntity('MapElement', topEnt);
                    topDrawable = em.getComponentForEntity('DrawableSprite', topEnt);
                }
            }

            if (topEnt) {                
                _cursor.previousSelection = _cursor.currentSelection;
                //if (_cursor.previousSelection != null) {
                //    $em(_cursor.previousSelection).comp('Spatial').update({ z: _cursor.oldZ });
                //}

                if (topEnt == _cursor.id()) {
                    _cursor.DrawableSprite.visible = false;
                    _cursor.currentSelection = null;
                }
                else {
                    var topEntSpatial = em.getComponentForEntity('Spatial', topEnt);
                    _cursor.Spatial.update({
                        x: topEntSpatial.x + topEntSpatial.width - _cursor.Spatial.width,
                        y: topEntSpatial.y + topEntSpatial.height - _cursor.Spatial.height
                    });
                    _cursor.MapElement.x = topMapElement.x;
                    _cursor.MapElement.y = topMapElement.y;
                    if (!_cursor.hide) {
                        _cursor.DrawableSprite.visible = true;
                    }
                    _cursor.currentSelection = topEnt;
                }
                //console.log(topEnt);                
                boc.utils.createEvent(
                    new bbq.events.MapSelectEvent({
                        action: 'select',
                        args: {
                            selected: _cursor.currentSelection,
                            previous: _cursor.previousSelection
                        }
                    }),
                    em
                );
                //if (_cursor.currentSelection != null) {
                //    _cursor.oldZ = $em(_cursor.currentSelection).comp('Spatial').z;
                //    if ($em(_cursor.currentSelection).has('Unit') || $em(_cursor.currentSelection).has('Building')) {
                //        $em(_cursor.currentSelection).comp('Spatial').update({ z: _cursor.Spatial.z - 1 });
                //    }
                //}
            }
            boc.utils.consumeEvent(idEventEnt, 'IdentifyEvent', em);
        } //i        
        // center camera
        $em('MouseEvent').each(function (e, c) {
            if (c.action === 'doubleclick') {
                var player = boc.utils.getCurrentPlayer();
                var unit = null;
                for (var u = 0; u < player.units.length; u++) {
                    unit = player.units[u];
                    if ($em(unit).comp('Unit').state === 'idle') {
                        // center the camera on this unit
                        var cx = (camera.xmin + camera.xmax) / 2;
                        var cy = (camera.ymin + camera.ymax) / 2;
                        var uspatial = $em(unit).comp('Spatial');
                        var ux = uspatial.x + uspatial.width / 2;
                        var uy = uspatial.y + uspatial.height / 2;
                        camera.move(ux - cx, uy - cy);
                        //console.log(unit);
                        break;
                    }
                } //u
                if (unit) {
                    boc.utils.createEvent(new boc.components.IdentifyEvent({ identifiedEntities: [unit] }), em);
                }
                boc.utils.consumeEvent(e, c.className(), em);
            }
        });
    }; // processTick
}; // MapSelectSystem

bbq.systems.ParabolicTranslationSystem = function (em) {

    this.processTick = function (frameTime) {
        var pEnts = em.getAllEntitiesWithComponent('ParabolicTranslationAnimation');
        for (var i = 0; i < pEnts.length; i++) {
            var pEnt = pEnts[i];
            var spatial = em.getComponentForEntity('Spatial', pEnt);
            var parabola = em.getComponentForEntity('ParabolicTranslationAnimation', pEnt);
            if (parabola.state != boc.constants.ANIMATION_PLAYING) { continue; }
            if (parabola.elapsedTime == 0) {
                if (parabola.dx == 0) { parabola.dx++; }
                var xstart = spatial.x;
                var xend = spatial.x + parabola.dx;
                var ystart = spatial.y;
                var yend = spatial.y + parabola.dy;                
                parabola.xstart = xstart;
                parabola.xend = xend;
                parabola.ystart = ystart;
                parabola.yend = yend;
                var xmid = (xstart + xend) / 2;
                var ymid = (ystart + yend) / 2 - parabola.height;
                var denom = (xstart - xmid) * (xstart - xend) * (xmid - xend);
                parabola.A = (xend * (ymid - ystart) + xmid * (ystart - yend) + xstart * (yend - ymid)) / denom;
                parabola.B = (xend * xend * (ystart - ymid) + xmid * xmid * (yend - ystart) + xstart * xstart * (ymid - yend)) / denom;
                parabola.C = (xmid * xend * (xmid - xend) * ystart + xend * xstart * (xend - xstart) * ymid + xstart * xmid * (xstart - xmid) * yend) / denom;
                parabola.m = (yend - ystart) / (xend - xstart);                
            } // setup

            parabola.elapsedTime += frameTime;

            if (parabola.elapsedTime >= parabola.duration) {
                spatial.update({
                    x: parabola.xend,
                    y: parabola.yend
                });
                parabola.state = boc.constants.ANIMATION_COMPLETE;
                parabola.notify('onComplete', { entity: pEnt });
                console.log('complete' + parabola.duration);
            }
            else {
                var easingFn = Math[parabola.easing] || 'linearTween';
                var newLeft = easingFn(parabola.elapsedTime, parabola.xstart, parabola.dx, parabola.duration);
                var newTop = parabola.A * newLeft * newLeft + parabola.B * newLeft + parabola.C;
                spatial.update({
                    x: newLeft,
                    y: newTop
                });
                //parabola.state = boc.constants.ANIMATION_PLAYING;
            }            
        } // i        
    }; // processTick
}; // ParabolicTranslationSystem

bbq.systems.FogSystem = function (em, map) {
    function updatePlayer(player) {
        var allPlayerEnts = em.getAllEntitiesWithComponent('Player');

        // decolor the opponent buildings, OR color it with the last color the player has seen
        for (var i = 0; i < allPlayerEnts.length; i++) {
            var pcomp = em.getComponentForEntity('Player', allPlayerEnts[i]);            

            for (var j = 0; j < pcomp.buildings.length; j++) {
                var bcomp = em.getComponentForEntity('Building', pcomp.buildings[j]);
                if (bcomp.type == 'HQ') { continue; }                
                var mcomp = em.getComponentForEntity('MapElement', pcomp.buildings[j]);
                var dcomp = em.getComponentForEntity('DrawableSprite', pcomp.buildings[j]);

                if (pcomp.id == player.id) {
                    // recolor my buildings
                    var imagePath = bbq.buildings.configuration[bcomp.type].defaultImagePath.replace('$(team)', pcomp.team.toLowerCase());
                    dcomp.image = boc.resources.GraphicsManager.getImage(imagePath);
                    continue;
                }

                var tileKey = mcomp.x + ',' + mcomp.y;
                var imagePath = null;

                // player does not currently see it 
                if (player.visibleMapTiles.indexOf(tileKey) == -1) {

                    // use the last seen
                    if (player.lastSeen[tileKey]) {
                        imagePath = bbq.buildings.configuration[bcomp.type].defaultImagePath.replace('$(team)', player.lastSeen[tileKey].toLowerCase());
                    }
                        // if i haven't even seen it, give it a neutral color
                    else {
                        imagePath = bbq.buildings.configuration[bcomp.type].defaultImagePath.replace('$(team)', 'neutral');
                    }
                }

                // player sees it. show the proper color
                else {
                    imagePath = bbq.buildings.configuration[bcomp.type].defaultImagePath.replace('$(team)', pcomp.team.toLowerCase());
                    player.lastSeen[tileKey] = pcomp.team;
                }

                if (imagePath) {
                    //console.log('--' + imagePath);
                    dcomp.image = boc.resources.GraphicsManager.getImage(imagePath);
                }
            } // j

        }//i
    }//updatePlayer

    function updateFog() {
        clearFog();
        var exclude = [];
        var allPlayers = em.getAllComponents('Player');
        var currPlayer = forPlayer || boc.utils.getCurrentPlayer(em);
        for (var h = 0; h < allPlayers.length; h++) {
            //var player = forPlayer || boc.utils.getCurrentPlayer(em);
            var player = allPlayers[h];
            player.visibleMapTiles = [];

            // get all units and buildings and clear the fog
            var unitsAndBuildingEnts = player.units.slice().concat(player.buildings.slice());        

            for (var i = 0; i < unitsAndBuildingEnts.length; i++) {
                var unitsAndBuildingEnt = unitsAndBuildingEnts[i];
                var unitsAndBuildingVision = em.getComponentForEntity('Vision', unitsAndBuildingEnt);
                var unitsAndBuildingMapElement = em.getComponentForEntity('MapElement', unitsAndBuildingEnt);
                //em.killEntity(map.getEntities(unitsAndBuildingMapElement.x, unitsAndBuildingMapElement.y, 'Fog')[0]);
                //if (unitsAndBuildingEnt == '717_DartBlower') {
                //    debugger;
                //}
                var rangeOffset = 0;
            
                var propEnts = map.getEntities(unitsAndBuildingMapElement.x, unitsAndBuildingMapElement.y, 'Prop');
                for (var j = 0; j < propEnts.length; j++) {
                    var prop = $em(propEnts[j]).comp('Prop');
                    if (prop && prop.type == 'tree') {
                        var bonus = bbq.tilesets.forest.props.properties.tree.visionBonus * 100;
                        if (bonus) { rangeOffset += bonus; }
                    }
                }
            
                var visibleTiles = bbq.utils.getTilesWithinVisionRange({
                    entityManager: em,
                    entity: unitsAndBuildingEnt,
                    costMap: map.costMap(),
                    costNodes: map.visionMap(),
                    sizeX: map.numColumns(),
                    sizeY: map.numRows(),
                    rangeOffset : rangeOffset
                });

                for (var j = 0; j < visibleTiles.length; j++) {
                    var tile = visibleTiles[j].split(',');
                    if (player.visibleMapTiles.indexOf(visibleTiles[j]) == -1) {
                        player.visibleMapTiles.push(visibleTiles[j]);
                    }
                    var invisibleunitsAndBuildingEnts = map.getEntities(+tile[0], +tile[1], 'Unit');
                    for (var k = 0; k < invisibleunitsAndBuildingEnts.length; k++) {
                        var invisibleUnitDrawable = em.getComponentForEntity('DrawableSprite', invisibleunitsAndBuildingEnts[k]);
                        if (invisibleUnitDrawable) { invisibleUnitDrawable.visible = true; }
                        var healthbarEnt = $em(invisibleunitsAndBuildingEnts[k]).comp('HealthBar').icon;
                        $em(healthbarEnt).comp('DrawableRect').visible = true;
                        var currentHealthbarEnt = $em(invisibleunitsAndBuildingEnts[k]).comp('HealthBar').currentIcon;
                        if (currentHealthbarEnt) { $em(currentHealthbarEnt).comp('DrawableRect').visible = true; }
                        var gatherComp = $em(invisibleunitsAndBuildingEnts[k]).comp('Gather');
                        if (gatherComp) {
                            var icon = gatherComp.icon;
                            $em(icon).comp('DrawableSprite').visible = true;
                        }
                        var captureComp = $em(invisibleunitsAndBuildingEnts[k]).comp('Capture');
                        if (captureComp) {
                            var icon = captureComp.icon;
                            $em(icon).comp('DrawableSprite').visible = true;
                        }

                    } //k
                    var fogEnts = map.getEntities(+tile[0], +tile[1], 'Fog');
                    for (var k = 0; k < fogEnts.length; k++) {
                        em.killEntity(fogEnts[k]);
                    } //k
                } //j
            } // i

            if (currPlayer.id == player.id) {
                //debugger;
                // update costs based on what's visible
                for (var i = 0; i < allPlayers.length ; i++) {
                    for (var j = 0; j < allPlayers[i].units.length; j++) {
                        if (currPlayer.id == allPlayers[i].id) { // exclude all my units
                            exclude.push(allPlayers[i].units[j]);
                        }
                        else { // exclude only enemy's invisible units
                            //debugger;
                            //var drawable = boc.utils.getDrawableComponent(allPlayers[i].units[j], em);
                            //if (drawable && !drawable.visible) {
                            //    exclude.push(allPlayers[i].units[j]);
                            //}                            
                            var eUnitTile = boc.utils.toTileKey($em(allPlayers[i].units[j]).comp('MapElement'));
                            if (currPlayer.visibleMapTiles.indexOf(eUnitTile) == -1) {
                                exclude.push(allPlayers[i].units[j]);
                            }
                        }
                    } //j
                } //i
                map.refresh(exclude);
                updatePlayer(player);
            }
            
        }
    }//updateFog

    function clearFog(update) {
        var allFogEnts = em.getAllEntitiesWithComponent('Fog');
        allFogEnts = allFogEnts.slice();

        var player = boc.utils.getCurrentPlayer(em);
        player.visibleMapTiles = [];

        for (var i = allFogEnts.length - 1; i >= 0 ; i--) {
            var fogMapElement = em.getComponentForEntity('MapElement', allFogEnts[i]);
            var tileKey = fogMapElement.x + ',' + fogMapElement.y;
            player.visibleMapTiles.push(tileKey);
            em.killEntity(allFogEnts[i]);
        }
        var allUnitEntities = em.getAllEntitiesWithComponent('Unit');
        for (var i = 0; i < allUnitEntities.length; i++) {
            em.getComponentForEntity('DrawableSprite', allUnitEntities[i]).visible = true;
        }

        if (update) { updatePlayer(player) };
    }//clearFog

    function drawFog(forPlayer) {
        if (!forPlayer) { forPlayer = boc.utils.getCurrentPlayer(); }
        
        for (var i = 0; i < map.numColumns() ; i++) {
            for (var j = 0; j < map.numRows() ; j++) {
                var tileKey = i + ',' + j;
                if (forPlayer.visibleMapTiles.indexOf(tileKey) >= 0) { continue; }

                var fogEnt = em.createEntity('fog(' + i + ',' + j + ')');
                em.addComponentToEntity(
                    new bbq.components.Fog(),
                    fogEnt
                );
                em.addComponentToEntity(
                    new boc.components.Spatial({
                        x: 0,
                        y: 0,
                        z: bbq.zindex.FOG,
                        width: map.tileWidth(),
                        height: map.tileHeight() 
                    }),
                    fogEnt
                );
                em.addComponentToEntity(
                    new boc.components.DrawableRect({
                        fillStyle: 'rgba(0, 0, 0, 0.6)',
                        lineWidth: 0
                    }),
                    fogEnt
                );
                map.place(fogEnt, i, j);
                var allUnits = map.getEntities(i, j, 'Unit');
                for (var k = 0; k < allUnits.length; k++) {
                    em.getComponentForEntity('DrawableSprite', allUnits[k]).visible = false;
                    var healthbarEnt = $em(allUnits[k]).comp('HealthBar').icon;
                    var currentHealthBarEnt = $em(allUnits[k]).comp('HealthBar').currentIcon;
                    $em(healthbarEnt).comp('DrawableRect').visible = false;
                    if (currentHealthBarEnt) { $em(currentHealthBarEnt).comp('DrawableRect').visible = false; }

                    var comp = $em(allUnits[k]).comp('Gather');
                    if (comp) {
                        var icon = comp.icon;
                        $em(icon).comp('DrawableSprite').visible = false;
                    }
                    comp = $em(allUnits[k]).comp('Capture');
                    if (comp) {
                        var icon = comp.icon;
                        $em(icon).comp('DrawableSprite').visible = false;
                    }
                } //k                
            } //j
        } //i              

        //var fogEnts = em.getAllEntitiesWithComponent('Fog');
        //for (var i = 0; i < fogEnts.length; i++) {
        //    try {
        //        em.addComponentToEntity(
        //            new boc.components.DrawableRect({
        //                fillStyle: 'rgba(0, 0, 0, 0.6)',
        //                lineWidth: 0
        //            }),
        //            fogEnts[i]
        //        );
        //    } catch (err) {
        //        // probably has it already, ignore
        //    }
        //} //i

    }//drawFog

    var forPlayer = null;
    this.processTick = function (frameTime) {
        var fogEventEnts = em.getAllEntitiesWithComponent('FogEvent');
        for (var i = 0; i < fogEventEnts.length; i++) {
            var fogEvent = em.getComponentForEntity('FogEvent', fogEventEnts[i]);
            if (fogEvent.action == 'update') {
                if (fogEvent.forPlayer) { forPlayer = fogEvent.forPlayer; }
                updateFog();
                boc.utils.consumeEvent(fogEventEnts[i], 'FogEvent', em);
            }
            else if (fogEvent.action == 'draw') {
                if (fogEvent.forPlayer) { forPlayer = fogEvent.forPlayer; }
                drawFog(forPlayer);
                boc.utils.consumeEvent(fogEventEnts[i], 'FogEvent', em);
            }
            else if (fogEvent.action == 'clear') {
                clearFog(true);
                boc.utils.consumeEvent(fogEventEnts[i], 'FogEvent', em);
            }
        } // i
    }; //processTick
}; //FogSystem

// animates units, issues commands, and so on
bbq.systems.UnitSystem = function (em) {
    this.processTick = function (timeFrame) {        
        var unitEventEnts = em.getAllEntitiesWithComponent('UnitEvent');
        for (var i = 0; i < unitEventEnts.length; i++) {
            var unitEvent = em.getComponentForEntity('UnitEvent', unitEventEnts[i]);
            
            if (unitEvent.action == 'inactivate' && $em(unitEvent.args.entity).exists()) {
                var unit = em.getComponentForEntity('Unit', unitEvent.args.entity);
                unit.state = 'inactive';
                var uspatial = em.getComponentForEntity('Spatial', unitEvent.args.entity);
                var udrawable = em.getComponentForEntity('DrawableSprite', unitEvent.args.entity);
                var inactiveImg = boc.utils.createFilteredImage(bbq.units.configuration[unit.type].defaultImagePath.replace('$(team)', boc.utils.getCurrentPlayer(em).team), uspatial.width, uspatial.height, 0.5);
                udrawable.image = inactiveImg;
                var uanimation = em.getComponentForEntity('SpriteAnimation', unitEvent.args.entity);
                if (uanimation) { uanimation.state = boc.constants.ANIMATION_STOPPED; }
                boc.utils.consumeEvent(unitEventEnts[i], 'UnitEvent', em);
            }            
        } //i 

        var mapSelectEventEnts = em.getAllEntitiesWithComponent('MapSelectEvent');
        for (var i = 0; i < mapSelectEventEnts.length; i++) {
            var mapSelectEvent = em.getComponentForEntity('MapSelectEvent', mapSelectEventEnts[i]);
            if (mapSelectEvent.action == 'select') {
                
                // return the previously selected entity into its default image state (unit or building only)
                if (mapSelectEvent.args.previous && (em.getComponentForEntity('Building', mapSelectEvent.args.previous) || em.getComponentForEntity('Unit', mapSelectEvent.args.previous))) {

                    // do this only if it's a building or if the unit is not inactive
                    if (!em.getComponentForEntity('Unit', mapSelectEvent.args.previous) || em.getComponentForEntity('Unit', mapSelectEvent.args.previous).state != 'inactive') {
                        var prevAnimComp = em.getComponentForEntity('SpriteAnimation', mapSelectEvent.args.previous);
                        if (prevAnimComp) {
                            prevAnimComp.state = boc.constants.ANIMATION_STOPPED;
                        }
                        var prevAnimSetComp = em.getComponentForEntity('SpriteAnimationSet', mapSelectEvent.args.previous);
                        var prevDrawable = em.getComponentForEntity('DrawableSprite', mapSelectEvent.args.previous);
                        if (prevAnimSetComp && prevDrawable) {
                            prevDrawable.image = prevAnimSetComp['default'];
                        }
                    }                                        
                } // previous

                // if the current player has this selected entity, do stuff
                if (mapSelectEvent.args.selected && boc.utils.getCurrentPlayer(em).hasEntity(mapSelectEvent.args.selected)) {
                    // animate idle if not inactive
                    var unit = em.getComponentForEntity('Unit', mapSelectEvent.args.selected);                    
                    if (unit) {
                        if (unit.state != 'inactive') {
                            var selectedAnimationSetComp = em.getComponentForEntity('SpriteAnimationSet', mapSelectEvent.args.selected);
                            if (selectedAnimationSetComp && selectedAnimationSetComp['idle']) {
                                var idleAnim = new boc.utils.SpriteAnimationSequence({
                                    entity: mapSelectEvent.args.selected,
                                    entityManager: em,
                                    loop: true,
                                    animations: [
                                        selectedAnimationSetComp['idle']
                                    ]
                                });
                                idleAnim.start();
                            }
                            boc.utils.createEvent(
                                new bbq.events.CommandEvent({
                                    action: 'showCommands',
                                    args: { entity: mapSelectEvent.args.selected }
                                }),
                                em
                            );
                        }
                        else { // inactive unit. hide commands
                            boc.utils.createEvent(
                                new bbq.events.CommandEvent({
                                    action: 'hideCommands',
                                    args: { entity: mapSelectEvent.args.selected }
                                }),
                                em
                            );
                        }
                    }
                    else { // probably a building
                        boc.utils.createEvent(
                            new bbq.events.CommandEvent({
                                action: 'showCommands',
                                args: { entity: mapSelectEvent.args.selected }
                            }),
                            em
                        );
                    }
                }

                // selected some entity not belonging to player
                else {
                    boc.utils.createEvent(
                        new bbq.events.CommandEvent({
                            action: 'hideCommands',
                            args: { entity: mapSelectEvent.args.selected }
                        }),
                        em
                    );
                }
                
                boc.utils.createEvent(new bbq.events.HudEvent({ entity: mapSelectEvent.args.selected }), em);
                //em.getComponentForEntity('UnitStats', em.getAllEntitiesWithComponent('UnitStats')[0])
                //        .target(mapSelectEvent.args.selected);
            } // select
            boc.utils.consumeEvent(mapSelectEventEnts[i], 'MapSelectEvent', em);
        } // i
    } // processTick 
}; //UnitSystem 

bbq.systems.UnitCollisionSystem = function (em, map) {

    this.processTick = function (frameTime) {
        var unitEventEnts = em.getAllEntitiesWithComponent('UnitEvent');
        for (var i = 0; i < unitEventEnts.length; i++) {
            var unitEventEnt = unitEventEnts[i];
            var unitEvent = em.getComponentForEntity('UnitEvent', unitEventEnt);
            if (unitEvent.action == 'moveEntity') { // this event should continue until the entity has stopped
                var movingPlayer = unitEvent.args.player;
                var movingEntity = unitEvent.args.entity;
                var movingSpatial = em.getComponentForEntity('Spatial', movingEntity);
                var movingMapElement = $em(movingEntity).comp('MapElement');
                var tile = map.getTile(movingEntity);
                map.place(movingEntity, tile.x, tile.y);


                var allPlayers = em.getAllComponents('Player');
                for (var j = 0; j < allPlayers.length; j++) {
                    if (allPlayers[j].id == movingPlayer.id) { continue; }
                    for (var k = 0; k < allPlayers[j].units.length; k++) {
                        var enemyUnitEnt = allPlayers[j].units[k];
                        var enemyUnitSpatial = em.getComponentForEntity('Spatial', enemyUnitEnt);
                        
                        // oh damn i collided with someone!
                        if (boc.utils.toBounds(enemyUnitSpatial).intersects(boc.utils.toBounds(movingSpatial))) {
                            // create a bouncey '!'
                            boc.utils.createBouncingText(
                                '!',
                                movingSpatial.x + movingSpatial.width - 14,
                                movingSpatial.y + 16,
                                {
                                    z: movingSpatial.z + 1,
                                    font: 'bold 14pt Helvetica',
                                    fillStyle : 'rgb(255,100,100)'
                                }
                            );
                            var mapTile = map.getTile(movingEntity);
                            map.place(movingEntity, mapTile.x, mapTile.y);
                            boc.utils.consumeEvent(unitEventEnt, 'UnitEvent', em);
                            boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: movingEntity } }), em);                            
                            //$em(movingEntity).comp('Unit').state = 'inactive';
                            $em(movingEntity).comp('Animation').state = boc.constants.ANIMATION_STOPPED;
                            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
                            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
                            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
                            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'showCursor' }), em);
                            $em(movingEntity).comp('Spatial').update({ x: mapTile.x * map.tileWidth(), y: mapTile.y * map.tileHeight() });
                        }
                    } //k 
                } //j
            }            
        } // i

    };//processTick
} //UnitCollisionSystem

bbq.systems.HudSystem = function (em, hud) {
    this.processTick = function (frameTime) {
        var hudEventEnts = em.getAllEntitiesWithComponent('HudEvent');
        for (var i = 0; i < hudEventEnts.length; i++) {
            var hudEventEnt = hudEventEnts[i];
            var hudEvent = em.getComponentForEntity('HudEvent', hudEventEnt);
                        
            if (hudEvent.action == 'update') {
                //em.getComponentForEntity('PlayerStats', em.getAllEntitiesWithComponent('PlayerStats')[0])
                //            .target(boc.utils.getCurrentPlayer(em));
                var currPlayer = boc.utils.getCurrentPlayer(em);
                hud.food(currPlayer.food);
            }
            if (typeof(hudEvent.entity) != 'undefined') {
                //em.getComponentForEntity('UnitStats', em.getAllEntitiesWithComponent('UnitStats')[0])
                //            .target(hudEvent.entity);
                var unit = hudEvent.entity ? $em(hudEvent.entity).comp('Unit') : null;
                
                if (unit) {
                    var unitConfig = bbq.units.configuration[unit.type];
                    if (unitConfig) {
                        hud.name(unitConfig.displayName);
                        hud.health(unitConfig.health);
                        hud.attack(unitConfig.attackDamage);
                        hud.movement(unitConfig.moveRange);
                        hud.vision(unitConfig.visionRange);
                        hud.range(unitConfig.attackMinRange + ' - ' + unitConfig.attackMaxRange);                        
                    }
                }
                else {
                    hud.clear();
                }
            }
            var currPlayer = boc.utils.getCurrentPlayer(em);
            hud.food(currPlayer.food);

            
            boc.utils.consumeEvent(hudEventEnt, 'HudEvent', em);
        } //i
    };//processTick
}; //HudSystem

bbq.systems.TrainingSystem = function (em, camera, map, p) {
    if (!p) { p = {}; }
    if (!p.scale) { p.scale = 1.0; } 
    var state = 'closed'; // closed, opened

    this.processTick = function (frameTime) {
        $em('TrainingEvent').each(function (e, c) {
            if (c.action == 'show') {
                boc.utils.createEvent(new boc.components.PanningCameraEvent('lock'), em);
                var options = {
                    x : (camera.xmax - camera.xmin) / 2 - 210,
                    y: (camera.ymax - camera.ymin) / 2 - 112,
                    onTrainClick : function(ent, unitType) {
                        // TODO: bonuses
                        var unitConfig = bbq.units.configuration[unitType];
                        var player = boc.utils.getCurrentPlayer(em);
                        if (player.food >= unitConfig.foodCost) {
                            player.updateFood(player.food - unitConfig.foodCost);
                            var currProduced = player.summary.unitsProduced || 0;
                            player.updateSummary({ unitsProduced: currProduced + 1 });
                            var unit = bbq.units.createUnit({ type: unitType }, player.team, em);
                            player.addUnit(unit);
                            var buildingMapElement = $em(c.entity).comp('MapElement');
                            map.place(unit, buildingMapElement.x, buildingMapElement.y);
                            $em(trainingWindow).kill();
                            state = 'closed';
                            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
                            boc.utils.createEvent(new boc.components.PanningCameraEvent('unlock'), em);
                            boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: unit } }), em);
                            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
                            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
                            boc.utils.getCurrentPlayer().moves.push('(' + buildingMapElement.x + ',' + buildingMapElement.y + ')t(\'' + unitType + '\')');
                        }
                        else {
                            // TODO: change alert
                            alert('Not enough food!');
                        }
                    },
                    onBackClick : function(ent) {
                        var event = new bbq.events.TrainingEvent('hide');
                        event.window = ent;
                        boc.utils.createEvent(event, em);
                        boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'showCommands', args: { entity: c.entity } }), em);
                        boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
                        boc.utils.createEvent(new boc.components.PanningCameraEvent('unlock'), em);
                    },
                    scale : p.scale
                };
                var trainingWindow = bbq.ui.createTrainingWindow(camera, options);                
                boc.utils.consumeEvent(e, c.className(), em);
                state = 'opened';
            }
            else if (c.action == 'hide') {
                $em(c.window).kill();
                boc.utils.consumeEvent(e, c.className(), em);
                state = 'closed';
            }
        });
    }; // processTick
}; //TrainingSystem

bbq.systems.HealthSystem = function (em) {
    this.processTick = function (frameTime) {
        var kill = null;
        $em('Health').each(function (e, c) {
            if (c.current <= 0) {
                // poof
                if (!kill) { kill = []; }
                kill.push(e);
                var kSpatial = $em(e).comp('Spatial');
                boc.utils.createSmokeEffect(kSpatial.x, kSpatial.y, em);
                var player = null;
                $em('Player').each(function(pe, pc) {
                    if (pc.hasEntity(e)) {
                        player = pc;
                    }
                });
                if (player) {
                    debugger;
                    player.removeUnit(e);
                }
                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
            }
        });
        while (kill && kill.length > 0) {
            $em(kill.pop()).kill();
        }

        $em('HealthBar').each(function (e, c) {
            if ($em(e).comp('DrawableSprite').visible) {
                var healthbarEnt = c.icon; // bg bar, which is 
                if (!c.currentIcon) { // actual health
                    var healthbarSpatial = $em(healthbarEnt).comp('Spatial');
                    c.currentIcon = $em.create();
                    $em(c.currentIcon)
                        .add(new boc.components.Spatial({ x: healthbarSpatial.x + 2, y: healthbarSpatial.y + 2, z: healthbarSpatial.z + 2, width : 0, height : 5 }))
                        .add(new boc.components.DrawableRect({fillStyle : 'lime', lineWidth : 0 }));
                    boc.utils.follow(healthbarEnt, c.currentIcon, em);
                    $em(healthbarEnt).listen('onKill', function () {
                        $em(c.currentIcon).kill();
                    });
                }
                var healthComp = $em(e).comp('Health');
                var barWidth = 42; //px
                var healthPct = healthComp.current / healthComp.max;
                $em(c.currentIcon).comp('Spatial').update({ width: Math.floor(barWidth * healthPct) });
                if (healthPct >= 0.65) {
                    $em(c.currentIcon).comp('DrawableRect').fillStyle = 'lime';
                }
                else if (healthPct >= 0.40) {
                    $em(c.currentIcon).comp('DrawableRect').fillStyle = 'gold';
                }
                else {
                    $em(c.currentIcon).comp('DrawableRect').fillStyle = 'firebrick';
                }

                if (healthComp.current >= healthComp.max) {
                    $em(healthbarEnt).comp('DrawableRect').visible = false;
                    $em(c.currentIcon).comp('DrawableRect').visible = false;
                }
                else {
                    $em(healthbarEnt).comp('DrawableRect').visible = true;
                    $em(c.currentIcon).comp('DrawableRect').visible = true;
                }
            }
        });
    }
}

bbq.systems.UpkeepSystem = function (em) {
    this.processTick = function (frameTime) {
        var currPlayer = boc.utils.getCurrentPlayer();
        if (!currPlayer.upkeep && currPlayer.turn > 1 &&
            SharedSession && SharedSession.user && SharedSession.user.playerid == currPlayer.id) {
            // update foods
            var totalFood = 0;
            $em('FoodProducer').each(function(e,c) {                
                if (currPlayer.hasEntity(e)) {
                    totalFood += c.food;
                    var spatial = $em(e).comp('Spatial');
                    var textDrawable = new boc.components.DrawableText({ text: c.food, fillStyle: 'white', shadow: { x: 1, y: 1 }, font: 'bold 10pt Helvetica' });
                    var foodDrawable = new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage("assets/UI/UnitTraining/iconFood.png"), visible: true });

                    //if (SharedSession && SharedSession.user && SharedSession.user.playerid == currPlayer.id) {
                    boc.utils.createScrollingDrawable(textDrawable, spatial.x + spatial.width / 2, spatial.y + spatial.height / 2 + 11, { easing: 'easeOutQuad', duration: 1300 });
                    boc.utils.createScrollingDrawable(foodDrawable, spatial.x + spatial.width / 2 - 10, spatial.y + spatial.height / 2, { easing: 'easeOutQuad', duration: 1300 });
                    //}
                }
            });

            $em('Gather').each(function (e, c) {                
                if (currPlayer.hasEntity(e)) {
                    var gatherableEnt = c.target;
                    var food = $em(gatherableEnt).comp('Gatherable').foodPerTurn;
                    totalFood += food;
                    var spatial = $em(e).comp('Spatial');
                    var textDrawable = new boc.components.DrawableText({ text: food, fillStyle: 'white', shadow: { x: 1, y: 1 }, font: 'bold 10pt Helvetica' });
                    var foodDrawable = new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage("assets/UI/UnitTraining/iconFood.png"), visible: true });
                    //if (SharedSession && SharedSession.user && SharedSession.user.playerid == currPlayer.id) {
                    boc.utils.createScrollingDrawable(textDrawable, spatial.x + spatial.width / 2, spatial.y + spatial.height / 2 + 11, { easing: 'easeOutQuad', duration: 1300 });
                    boc.utils.createScrollingDrawable(foodDrawable, spatial.x + spatial.width / 2 - 10, spatial.y + spatial.height / 2, { easing: 'easeOutQuad', duration: 1300 });
                    //}
                }
            });

            currPlayer.updateFood(currPlayer.food + totalFood);
            currPlayer.upkeep = true;

            // TODO: buff ticks
            // TODO: debuff ticks
        }
    }
}


// saves the current players state and/or move set
bbq.systems.SaveSystem = function (gameObj, em) {

    // serialize to a state object
    function serializePlayer(player) {                
        var toReturn = {
            food: player.food,
            turn: player.turn,
            team: player.team,
            upkeep: player.upkeep,
            buildings: [],
            units: [],
            lastSeen: player.lastSeen
        };

        // TODO: player buffs
        for (var b = 0; b < player.buildings.length; b++) {
            var building = player.buildings[b];
            var btile = $em(building).comp('MapElement');

            //TODO: building buffs
            var buffArr = undefined;
            //if (building.Buffable && building.Buffable.buffs.length > 0) {
            //    buffArr = [];
            //    for (var z = 0; z < building.Buffable.buffs.length; z++) {
            //        var jsonBuff = BuffUtils.getBuffJson(building.Buffable.buffs[z]);
            //        buffArr.push(jsonBuff);
            //    } // z
            //}
            var debuffArr = undefined;
            //if (building.Debuffable && building.Debuffable.debuffs.length > 0) {
            //    debuffArr = [];
            //    for (var z = 0; z < building.Debuffable.debuffs.length; z++) {
            //        var jsonDebuff = BuffUtils.getDebuffJson(building.Debuffable.debuffs[z]);
            //        debuffArr.push(jsonDebuff);
            //    } // z
            //}
            var bstate = {
                type: $em(building).comp('Building').type.replace(/\s/g, ''),
                location: { x: btile.x, y: btile.y },
                turnsUntilCapture: $em(building).comp('Building').turnsUntilCapture,
                buffs: buffArr,
                debuffs: debuffArr
            };
            toReturn.buildings.push(bstate);
        } // b

        for (var u = 0; u < player.units.length; u++) {
            var unit = player.units[u];
            var utile = $em(unit).comp('MapElement');
            var uoptions = {};
            if ($em(unit).comp('Unit').type == 'Gatherer') {
                uoptions.gatherTarget = $em(unit).has('Gather');
                uoptions.captureTarget = $em(unit).has('Capture');
            }
            uoptions.kills = $em(unit).comp('Unit').kills;

            // TODO: unit buffs
            var buffArr = undefined;
            //if (unit.Buffable && unit.Buffable.buffs.length > 0) {
            //    buffArr = [];
            //    for (var z = 0; z < unit.Buffable.buffs.length; z++) {
            //        var jsonBuff = BuffUtils.getBuffJson(unit.Buffable.buffs[z]);
            //        buffArr.push(jsonBuff);
            //    } // z
            //}
            var debuffArr = undefined;
            //if (unit.Debuffable && unit.Debuffable.debuffs.length > 0) {
            //    debuffArr = [];
            //    for (var z = 0; z < unit.Debuffable.debuffs.length; z++) {
            //        var jsonDebuff = BuffUtils.getDebuffJson(unit.Debuffable.debuffs[z]);
            //        debuffArr.push(jsonDebuff);
            //    } // z
            //}
            var ustate = {
                type: $em(unit).comp('Unit').type.replace(/\s/g, ''),
                location: { x: utile.x, y: utile.y },
                state: $em(unit).comp('Unit').state,
                hp: $em(unit).comp('Health').current,
                options: uoptions,
                buffs: buffArr,
                debuffs: debuffArr
            }
            toReturn.units.push(ustate);
        } // u

        return toReturn;
    } // serializePlayer

    function saveGameState(playerid, onSave) {
        //var player = boc.utils.getPlayer(playerid);
        //if (!player) { throw 'player ' + playerid + ' not found'; }      
        var turnEnt = $em('Turn').all()[0];
        var newGameState =
		{
		    turn: $em(turnEnt).comp('Turn').playerid,
		    state: {}, // playerState
		    lastupdate: +new Date,
		    summary: { players: [] }
		};

        for (var i = 0; i < gameObj.players().length; i++) {
            var pl = gameObj.players()[i];
            newGameState.summary.players.push(pl.summary);
            newGameState.state[pl.id] = serializePlayer(pl);
        }

        //console.log(newGameState);
        var query = JSON.stringify({gameid:gameObj.id()});
        var document = JSON.stringify(newGameState);
        boc.utils.getJson(
            'transact/update/games', 
            {
                query : query,
                document : document
            }, 
            function (json) {
                if (onSave) {
                    onSave();
                }
            }
        ); // getJson
    } // saveGameState

    function saveMoves(playerid, onSave) {
        var moves = [];
        var player = boc.utils.getPlayer(playerid);
        if (!player) { throw 'player ' + playerid + ' not found'; }
        for (var i = 0; i < player.moves.length; i++) {
            moves.push({ playerid: player.id, command: player.moves[i], turn: player.turn });
        }

        var queryDoc = {
            query: JSON.stringify({ gameid: gameObj.id() }),
            document: JSON.stringify({ $pushAll: { moves: moves } })
        };

        boc.utils.getJson('transact/update/games', queryDoc, function (json) {
            //console.log(moves);
            player.moves = []; //player.clearMoves();
            //console.log(json);              
            if (onSave) {
                onSave();
            }
        });

        //console.log(moves);               
    } //saveMoves

    this.processTick = function (frameTime) {
        $em('SaveEvent').each(function (e, c) {
            if (c.action == 'saveAll') {
                saveGameState(
                    c.playerid,
                    function () {
                        //debugger;
                        saveMoves(c.playerid, c.onSaveComplete);
                    }
                );
            }
            else if (c.action == 'saveGameState') {
                saveGameState(c.playerid, c.onSaveComplete);
            }
            else if (c.action == 'saveMoves') {
                saveMoves(c.playerid, c.onSaveComplete);
            }
            boc.utils.consumeEvent(e, c.className(), em);
        });
    }; // processTick
} // SaveSystem

bbq.systems.VictorySystem = function (gameObj, em) {
    this.processTick = function () {
        $em('VictoryEvent').each(function (e, c) {
            if (gameObj.victoryCondition) {
                gameObj.victoryCondition(gameObj, c);
            }
            boc.utils.consumeEvent(e, 'VictoryEvent', em);
        });
    }
} // VictorySystem