ns('bbq.events');
bbq.events.TrainingEvent = function (p) {
    this.action = p;
    this.className = function () { return 'TrainingEvent'; }
};