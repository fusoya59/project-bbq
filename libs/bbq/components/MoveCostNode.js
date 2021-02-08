// cost {int}
ns('bbq.components');
bbq.components.MoveCostNode = function (c) {
    this.cost = c;
    this.className = function () { return 'MoveCostNode'; }
};