ns('bbq.events');
bbq.events.MapSelectEvent = function (p) {
    this.action = p.action;
    this.args = p.args;
    this.timeStamp = +new Date;
    this.className = function () { return 'MapSelectEvent'; }
};