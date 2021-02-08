ns('bbq.events');
// p = type, q = player
bbq.events.VictoryEvent = function (p, q) {
    this.type = p;
    this.player = q;
    this.className = function () { return 'VictoryEvent'; }
};