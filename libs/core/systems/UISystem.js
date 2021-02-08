ns('boc.systems');

// handles ui clicks. events not injected into the system because i want this to be as immediate as possible.
boc.systems.UISystem = function (em) {
    this.processTick = function (frameTime) {
        var identifyEvents = em.getAllEntitiesWithComponent('IdentifyEvent');

        var entsToKill = [];
        for (var i = 0; i < identifyEvents.length; i++) {
            var idEventEnt = identifyEvents[i];
            var idEvent = em.getComponentForEntity('IdentifyEvent', idEventEnt);
            var sortedEnts = idEvent.identifiedEntities.slice()
                .sort(function (a, b) {
                    var spatialA = em.getComponentForEntity('Spatial', a);
                    var spatialB = em.getComponentForEntity('Spatial', b);

                    if (!spatialA && !spatialB) { return 0; }
                    if (spatialA && !spatialB) { return 1; }
                    if (!spatialA && spatialB) { return -1; }
                    return spatialA.z - spatialB.z;
                });

            var topEnt = sortedEnts.pop();
            var topUIElement = em.getComponentForEntity('UIElement', topEnt);
            var topDrawable = boc.utils.getDrawableComponent(topEnt, em);
            while (topEnt && (!topUIElement || !topDrawable.visible)) {
                topEnt = sortedEnts.pop();
                if (topEnt) {
                    topUIElement = em.getComponentForEntity('UIElement', topEnt);
                    topDrawable = boc.utils.getDrawableComponent(topEnt, em);;
                }
            }

            if (topEnt) {
                //console.log('UI: ' + topEnt);
                if (topUIElement.onclick) { topUIElement.onclick({ entity: topEnt }); }
                entsToKill.push(idEventEnt);
            }
            //boc.utils.consumeEvent(idEventEnt, 'IdentifyEvent', em);            
        } //i

        while (entsToKill.length > 0) {
            em.killEntity(entsToKill.pop());
        }
    } // processTick
}; //UISystem