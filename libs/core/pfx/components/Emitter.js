ns('boc.pfx.components');

boc.pfx.components.Emitter = function (obj) {
    this.particleFactory = obj.particleFactory;
    this.startVector = obj.startVector;
    this.startVelocity = obj.startVelocity;
    this.emitRadius = obj.emitRadius; // degrees
    this.accelerationVector = obj.accelerationVector;
    this.particleDuration = obj.particleDuration;
    this.particlesPerSecond = obj.particlesPerSecond;
    this.particlesPerMillisecond = obj.particlesPerSecond / 1000;
    this.elapsedSinceLastEmit = 0;
    this.className = function () { return 'Emitter'; }
};