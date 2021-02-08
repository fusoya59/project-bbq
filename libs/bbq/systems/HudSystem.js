ns('bbq.systems');

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
            if (typeof (hudEvent.entity) != 'undefined') {
                //em.getComponentForEntity('UnitStats', em.getAllEntitiesWithComponent('UnitStats')[0])
                //            .target(hudEvent.entity);
                var unit = hudEvent.entity ? $em(hudEvent.entity).comp('Unit') : null;

                if (unit) {
					hud.showUnitStats();
                    var unitConfig = bbq.units.configuration[unit.type];
                    if (unitConfig) {
                        hud.name(unitConfig.displayName);
                        hud.health($em(hudEvent.entity).comp('Health').current);
                        hud.attack($em(hudEvent.entity).comp('Attack').damage);
                        hud.movement(Math.floor($em(hudEvent.entity).comp('Movement').range / 100));
                        hud.vision(Math.floor($em(hudEvent.entity).comp('Vision').range / 100));
                        hud.range(Math.floor($em(hudEvent.entity).comp('Attack').minRange / 100) +
                            ' - ' + Math.floor($em(hudEvent.entity).comp('Attack').maxRange / 100));
                    }
                }
                else {
                    //hud.clear();
					hud.hideUnitStats();
                }
            }
            var currPlayer = boc.utils.getCurrentPlayer(em);
            hud.food(currPlayer.food);


            boc.utils.consumeEvent(hudEventEnt, 'HudEvent', em);
        } //i
    };//processTick
}; //HudSystem