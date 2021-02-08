ns('bbq.components');
bbq.components.ReplayScript = function (p, q, r) {
    this.playerId = p;
    this.script = q;
    this.onComplete = r;
    this.className = function () { return 'ReplayScript'; }
};