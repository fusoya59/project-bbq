ns('bbq.components');
// p: x, q: y, r: range, s: src playerid
bbq.components.RevealSpot = function (p, q, r, s) {
    this.x = p;
    this.y = q;
    this.range = r;
    this.srcPlayerId = s;
    this.className = function () {
        return 'RevealSpot';
    };
};