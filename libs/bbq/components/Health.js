// current {int}, max {int}
ns('bbq.components');
bbq.components.Health = function (obj) {
    this.current = obj.current;
    this.max = obj.max;
    this.className = function () { return 'Health'; }
};