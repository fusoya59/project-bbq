ns('bbq.components');
// p : reveal range, q : reveal radius
bbq.components.Reveal = function (p, q) {
    this.range = p;
    this.radius = q;
    this.className = function () {
        return 'Reveal';
    };
};