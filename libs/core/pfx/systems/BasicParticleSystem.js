ns('boc.pfx.systems');

// finds any EmitterBurstEvent and emits particles
// gets all emitters and emits particles
// updates all particles
boc.pfx.systems.BasicParticleSystem = function (entityManager) {
    var em = entityManager;
    var iter = 0;
        
    function emit(emitComp, spatialComp) {
        var startVector = { x: emitComp.startVector.x, y: emitComp.startVector.y };
        // randomize it a little
        var disturbanceDeg = (Math.random() * emitComp.emitRadius) - emitComp.emitRadius / 2;
        var disturbanceRad = boc.utils.degToRad(disturbanceDeg);
        startVector.x = emitComp.startVector.x * Math.cos(disturbanceRad) - emitComp.startVector.y * Math.sin(disturbanceRad);
        startVector.y = emitComp.startVector.y * Math.cos(disturbanceRad) + emitComp.startVector.x * Math.sin(disturbanceRad);            
        return emitComp.particleFactory.create(spatialComp, startVector, emitComp.startVelocity, emitComp.accelerationVector, emitComp.particleDuration, spatialComp.z);
    }
        
    this.processTick = function (frameTime) {
        var burstEvents = em.getAllEntitiesWithComponent('EmitterBurstEvent');
        for (var i = 0; i < burstEvents.length; i++) {
            var eventEnt = burstEvents[i];
            var eventComp = em.getComponentForEntity('EmitterBurstEvent', eventEnt);
            var emitter = em.getComponentForEntity('Emitter', eventComp.target);
            var spatial = em.getComponentForEntity('Spatial', eventComp.target);
            if (emitter) {
                var maxToEmit = Math.min(eventComp.count, emitter.particleFactory.maxParticles());
                for (var j = 0; j < maxToEmit; j++) {
                    emit(emitter, spatial);    
                }                    
            }
            boc.utils.consumeEvent(eventEnt, 'EmitterBurstEvent', em);
        } // i
            
        // handle emits
        var emitEnts = em.getAllEntitiesWithComponent('Emitter');

        // emit linearly
        for (var i = 0; i < emitEnts.length; i++) {
            var emitEnt = emitEnts[i];
            var emitComp = em.getComponentForEntity('Emitter', emitEnt);
            var spatialComp = em.getComponentForEntity('Spatial', emitEnt);
            emitComp.elapsedSinceLastEmit += frameTime;
            var mspp = 1 / emitComp.particlesPerMillisecond;
            if (emitComp.elapsedSinceLastEmit >= mspp) {
                var numEmitted = 0;
                while (emitComp.elapsedSinceLastEmit >= mspp && numEmitted <= emitComp.particleFactory.maxParticles()) {                        
                    if (!emit(emitComp, spatialComp)) {                            
                        emitComp.elapsedSinceLastEmit = 0;
                        break;
                    }
                    emitComp.elapsedSinceLastEmit -= mspp;
                    numEmitted++;
                        
                }
                if (numEmitted > 0) {
                    emitComp.elapsedSinceLastEmit = 0;
                }
            }
        } // i

        // update particles
        var particleEnts = em.getAllEntitiesWithComponent('Particle');
        for (var i = 0; i < particleEnts.length; i++) {
            var particleEnt = particleEnts[i];
            var particle = em.getComponentForEntity('Particle', particleEnt);
            var spatial = em.getComponentForEntity('Spatial', particleEnt);

            var delta = {
                x: spatial.x + particle.directionVector.x * particle.velocity_ppms * frameTime,
                y: spatial.y + particle.directionVector.y * particle.velocity_ppms * frameTime
            };

            spatial.update(delta);
            particle.directionVector.x += particle.accelerationVector.x;
            particle.directionVector.y += particle.accelerationVector.y;
        } // i

        /*
                    iter++;
                    if (iter % 10 == 0) {
                        console.log(particleEnts.length);
                    }*/
            
    }; // processTick
};//ParticleSystem