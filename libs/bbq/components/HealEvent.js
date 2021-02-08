ns('bbq.events');
// p : healing entity
bbq.events.HealEvent = function (p) {
    this.entity = p;
    this.className = function () {
        return 'HealEvent';
    };
};