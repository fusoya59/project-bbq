ns('bbq.systems');

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

                //if (player.visibleMapTiles.indexOf2(tileKey) == -1) {
                var found = false;
                for (var k = 0, klen = player.visibleMapTiles.length; k < klen; k++) {
                    if (player.visibleMapTiles[k] === tileKey) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
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
                    rangeOffset: rangeOffset
                });

                $em('RevealSpot').each(function (e, c) {
                    var revealedTiles = bbq.utils.getTilesWithinRevealRange({
                        entityManager: em,
                        entity: e,
                        costMap: map.costMap(),
                        costNodes: map.attackMap(),
                        sizeX: map.numColumns(),
                        sizeY: map.numRows(),
                        rangeOffset: 0,
                        rangeComponentName: 'RevealSpot',
                        rangePropertyName: 'range'
                    });

                    for (var j = 0, rlen = revealedTiles.length; j < rlen; j++) {
                        //if (visibleTiles.indexOf2(revealedTiles[j]) == -1) {
                        //    visibleTiles.push(revealedTiles[j]);
                        //}
                        var found = false;
                        for (var k = 0, vlen = visibleTiles.length; k < vlen; k++) {
                            if (revealedTiles[j] === visibleTiles[k]) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            visibleTiles.push(revealedTiles[j]);
                        }
                    }
                });

                for (var j = 0; j < visibleTiles.length; j++) {
                    var tile = visibleTiles[j].split(',');
                    //if (player.visibleMapTiles.indexOf(visibleTiles[j]) == -1) {
                    //if (player.visibleMapTiles.indexOf2(visibleTiles[j]) == -1) {
                    var found = false;
                    for (var k = 0, klen = player.visibleMapTiles.length; k < klen; k++) {
                        if (player.visibleMapTiles[k] === visibleTiles[j]) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        player.visibleMapTiles.push(visibleTiles[j]);
                    }
                    var invisibleunitsAndBuildingEnts = map.getEntities(+tile[0], +tile[1], 'Unit');
                    for (var k = 0; k < invisibleunitsAndBuildingEnts.length; k++) {
                        var invisibleUnitDrawable = em.getComponentForEntity('DrawableSprite', invisibleunitsAndBuildingEnts[k]) || em.getComponentForEntity('SpineDrawable', invisibleunitsAndBuildingEnts[k]);
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
                            //if (currPlayer.visibleMapTiles.indexOf2(eUnitTile) == -1) {
                            var found = false;
                            for (var k = 0, klen = currPlayer.visibleMapTiles.length; k < klen; k++) {
                                if (currPlayer.visibleMapTiles[k] === eUnitTile) {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found) {
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
            var drawable = em.getComponentForEntity('DrawableSprite', allUnitEntities[i]) || em.getComponentForEntity('SpineDrawable', allUnitEntities[i]);
            drawable.visible = true;
        }
        if (update) {
            updatePlayer(player)
        };
    }//clearFog

    function drawFog(forPlayer) {
        if (!forPlayer) { forPlayer = boc.utils.getCurrentPlayer(); }

        var visibleMapTiles = {};
        for (var k = 0, klen = forPlayer.visibleMapTiles.length; k < klen; k++) {
            visibleMapTiles[forPlayer.visibleMapTiles[k]] = true;
        }

        var mw = map.tileWidth(), mh = map.tileHeight();
        for (var i = 0, cols = map.numColumns() ; i < cols ; i++) {
            for (var j = 0, rows = map.numRows() ; j < rows ; j++) {                
                var tileKey = i + ',' + j;
                //if (forPlayer.visibleMapTiles.indexOf2(tileKey) >= 0) {
                
                if (visibleMapTiles[tileKey]) {
                    continue;
                }

                var fogEnt = em.createEntity('fog(' + i + ',' + j + ')');
                

                em.addComponentToEntity(
                    new bbq.components.Fog(),
                    fogEnt
                );
                
                var spat = new boc.components.Spatial({
                    x: 0,
                    y: 0,
                    z: bbq.zindex.FOG,
                    width: mw,
                    height: mh
                });

                em.addComponentToEntity(
                    spat,
                    fogEnt
                );
                
                em.addComponentToEntity(
                    new boc.components.DrawableRect({
                        fillStyle: 'rgba(0, 0, 0, 0.6)',
                        lineWidth: 0
                    }, true),
                    fogEnt
                );
                
                map.place(fogEnt, i, j);
                
                
                var allUnits = map.getEntities(i, j, 'Unit');
                for (var k = 0; k < allUnits.length; k++) {
                    var dunit = em.getComponentForEntity('DrawableSprite', allUnits[k]) || em.getComponentForEntity('SpineDrawable', allUnits[k]);
                    dunit.visible = false;
                    var healthbarEnt = $em(allUnits[k]).comp('HealthBar').icon;
                    var currentHealthBarEnt = $em(allUnits[k]).comp('HealthBar').currentIcon;
                    $em(healthbarEnt).comp('DrawableRect').visible = false;
                    if (currentHealthBarEnt) {
                        $em(currentHealthBarEnt).comp('DrawableRect').visible = false;
                    } else {
                        console.log('no current health bar for', allUnits[k]);
                    }

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
            //var start = +new Date;
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
            //console.log(fogEvent.action, 'time taken', (+new Date - start), 'ms');
        } // i
    }; //processTick
}; //FogSystem