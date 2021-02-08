// cost {int}
ns('bbq.components');
bbq.components.AttackCostNode = function (c) {
    this.cost = c;
    this.className = function () { return 'AttackCostNode'; }
};