ns('bbq.components');
bbq.components.Gatherable = function (p) {
    this.foodPerTurn = p;
    this.className = function () { return 'Gatherable'; }
};