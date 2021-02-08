ns('bbq.components');
// cost {int}
bbq.components.VisionCostNode = function (c) {
    this.cost = c;
    this.className = function () { return 'VisionCostNode'; }
};