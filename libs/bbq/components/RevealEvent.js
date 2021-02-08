ns('bbq.events');
// p : revealing entity
bbq.events.RevealEvent = function (p) {
    this.entity = p;
    this.className = function () {
        return 'RevealEvent';
    };
};