ns('bbq.events');
bbq.events.HudEvent = function (p) {        
    this.action = p.action;
    this.entity = p.entity;
    this.className = function () { return 'HudEvent'; }
};