// minRange {int}, maxRange {int}, damage {int}
ns('bbq.components');
bbq.components.Attack = function (obj) {
    this.minRange = obj.minRange;
    this.maxRange = obj.maxRange;
    this.damage = obj.damage;
    this.className = function () { return 'Attack'; }
};