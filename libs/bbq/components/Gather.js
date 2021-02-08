ns('bbq.components');

bbq.components.Gather = function (p, q) {
    this.target = p;
    this.icon = q;
    this.className = function () { return 'Gather'; }
};