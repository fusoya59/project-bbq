ns('boc.pfx.components');

// tags an entity as a particle.
// directionVector {x,y} the normalized vector that this particle is headed to,
// velocity {float} the speed at which this particle is moving (px / sec),
// accelerationVector {x,y} the acceleration that this particle is going
boc.pfx.components.Particle = function (obj) {
    this.directionVector = obj.directionVector; // normalized
    this.veloctiy = obj.velocity; // pixel per second
    this.velocity_ppms = obj.velocity / 1000; // just so i don't have to calculate it each iteration
    this.accelerationVector = obj.accelerationVector;

    this.className = function () { return 'Particle'; }
};