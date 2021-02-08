// gold arrows, heading
ns('bbq.components');
bbq.components.MoveArrow = function (p) {
    this.heading = p; // n, s, e, w
    this.className = function () { return 'MoveArrow'; }
};