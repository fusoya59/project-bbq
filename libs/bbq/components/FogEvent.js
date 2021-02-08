ns('bbq.events');
bbq.events.FogEvent = function (p) {
    this.action = p.action;
    this.forPlayer = p.forPlayer;
    this.args = p.args;
    this.timeStamp = +new Date;
    this.className = function () { return 'FogEvent'; }
};