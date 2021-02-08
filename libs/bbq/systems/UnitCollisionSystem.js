ns('bbq.systems');

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
                //map.place(movingEntity, tile.x, tile.y);                
                //console.log('movementTiles', unitEvent.movementTiles.path[unitEvent.movementTiles.pindex]); // look ahead

                var allPlayers = em.getAllComponents('Player');
                for (var j = 0; j < allPlayers.length; j++) {
                    if (allPlayers[j].id == movingPlayer.id) { continue; }
                    for (var k = 0; k < allPlayers[j].units.length; k++) {
                        var enemyUnitEnt = allPlayers[j].units[k];
                        var enemyUnitSpatial = em.getComponentForEntity('Spatial', enemyUnitEnt);
                        //console.log(enemyUnitEnt, boc.utils.toBounds(enemyUnitSpatial));

                        // oh damn i collided with someone!
                        //console.log(enemyUnitEnt, map.getTile(enemyUnitEnt), tile);                        
                        if (boc.utils.toBounds(enemyUnitSpatial).intersects(boc.utils.toBounds(movingSpatial))) {
                            // create a bouncey '!'
                            var audio = bbq.sh().getAudio(movingEntity, 'unitCollide');
                            if (audio) {
                                bbq.sh().play(audio);
                            }
                            boc.utils.createBouncingText(
                                '!',
                                movingSpatial.x + movingSpatial.width - 14,
                                movingSpatial.y + 16,
                                {
                                    z: movingSpatial.z + 1,
                                    font: 'bold 14pt Helvetica',
                                    fillStyle: 'rgb(255,100,100)'
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
                            var commands = $em(movingEntity).comp('Commandable').commands;
                            // find the move command and execute the moveend if it's there
                            for (var c = 0; c < commands.length; c++) {
                                if (commands[c].name() === 'Move' && commands[c].onMoveEnd) {
                                    commands[c].onMoveEnd();
                                }
                            }
                        }
                    } //k 
                } //j
            }
        } // i

    };//processTick
}; //UnitCollisionSystem