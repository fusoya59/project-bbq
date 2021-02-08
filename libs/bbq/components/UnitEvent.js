ns('bbq.events');
bbq.events.UnitEvent = function (p) {
    this.action = p.action;
    this.args = p.args;
    this.timeStamp = +new Date;
    this.className = function () { return 'UnitEvent'; }
};