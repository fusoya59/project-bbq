ns('boc.pfx');

boc.pfx.ParticleFactory = function (entityManager) {
    this.maxParticles = function () { return 0; }
    // creates a particle entity
    this.create = function (startPoint, startVector, velocity, acceleration, duration) {
        return null; // string
    }
}; // interface for particle factories