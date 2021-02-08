// x {int}, y {int}
ns('bbq.components');
bbq.components.MapElement = function (obj) {
    this.x = obj.x;
    this.y = obj.y;
    this.className = function () { return 'MapElement'; }
};