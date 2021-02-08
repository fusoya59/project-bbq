ns('bbq.components');
// minRange {int}, maxRange {int}, damage {int}
bbq.components.Retaliate = function (obj) {
    this.minRange = obj.minRange;
    this.maxRange = obj.maxRange;
    this.damage = obj.damage;
    this.className = function () { return 'Retaliate'; }
};