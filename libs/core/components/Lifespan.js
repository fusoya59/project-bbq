ns('boc.components');

// how long an entity is alive for
// duration {number}
boc.components.Lifespan = function(obj) {
    this.duration = obj.duration;
    this.elapsed = 0;
    this.onKill = null;
    this.className = function () { return 'Lifespan'; }
};