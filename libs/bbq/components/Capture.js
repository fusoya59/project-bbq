ns('bbq.components');
bbq.components.Capture = function (p, q) {
    this.target = p;
    this.icon = q;
    this.className = function () { return 'Capture'; }
};