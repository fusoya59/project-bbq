ns('boc.systems');

// kills entities w/ Lifespan component    
boc.systems.LifespanSystem = function (entityManager) {
    var em = entityManager;
    this.processTick = function (frameTime) {
        var ents = em.getAllEntitiesWithComponent('Lifespan');
        if (ents) { ents = ents.slice(); }
        for (var i = 0; i < ents.length; i++) {
            var lifespanComponent = em.getComponentForEntity('Lifespan', ents[i]);
            lifespanComponent.elapsed += frameTime;
            if (lifespanComponent.elapsed >= lifespanComponent.duration || lifespanComponent.duration <= 0) {
                em.killEntity(ents[i]);
                if (lifespanComponent.onKill) { lifespanComponent.onKill(); }
            }
        } // i
    } // processTick
};