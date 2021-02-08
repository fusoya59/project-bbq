ns('boc.pfx.particleFactories');

boc.pfx.particleFactories.FadingStarFactory = function (entityManager, max) {
    var em = entityManager;

    var _maxParticles = max || 25;
    var _queue = new Array(_maxParticles);
    var _currParticleIndex = 0;
    var _image = boc.resources.GraphicsManager.getImage('assets/graphics/pfx_star_small.png');
    this.maxParticles = function () { return _maxParticles; }
    var _numParticles = 0;

    this.create = function (startPoint, startVector, velocity, acceleration, duration, z) {
        if (_numParticles >= _maxParticles) { return null; }
        if (_currParticleIndex >= _maxParticles) {
            _currParticleIndex = 0;
        }
        if (_queue[_currParticleIndex]) {
            var lifespan = em.getComponentForEntity('Lifespan', _queue[_currParticleIndex]);
            if (lifespan) {
                lifespan.duration = 0;
            }
        }
        var particleEnt = em.createEntity();
        _queue[_currParticleIndex] = particleEnt;
        em.addComponentToEntity(
            new boc.pfx.components.Particle({
                directionVector: startVector,
                velocity: velocity,
                accelerationVector: acceleration
            }),
            particleEnt
        );

        // align it @ the center
        em.addComponentToEntity(
            new boc.components.Spatial({
                x: startPoint.x + _image.width / 2,
                y: startPoint.y + _image.height / 2,
                z: z,
                width: _image.width,
                height: _image.height
            }),
            particleEnt
        );
        em.addComponentToEntity(
            new boc.components.DrawableSprite({
                image: _image,
                alpha: 1.0
            }),
            particleEnt
        );
        em.addComponentToEntity(
            new boc.components.Lifespan({ duration: duration }),
            particleEnt
        );

        //fade animation
        em.addComponentToEntity(
            new boc.components.Animation({
                componentName: 'DrawableSprite',
                propertyDeltas: { alpha: -1.0 },
                duration: duration,
                easing: 'easeOutQuad',
                state : boc.constants.ANIMATION_PLAYING
            }),
            particleEnt
        );
        _currParticleIndex++;
        return particleEnt;
    }
};