ns('bbq.components');
// range {int}, velocity {int}, bonus {function(tileType)}
bbq.components.Movement = function (obj) {
    this.range = obj.range;
    this.velocity = obj.velocity || 200; // ms per tile
    this.bonus = obj.bonus;
    this.className = function () { return 'Movement'; }
};