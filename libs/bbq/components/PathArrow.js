ns('bbq.components');
// blue arrows, heading
bbq.components.PathArrow = function (p) {
    this.heading = p; // n, s, e, w
    this.className = function () { return 'PathArrow'; }
};