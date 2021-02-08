ns('bbq.components');
// range {int}
bbq.components.Vision = function (obj) {
    this.range = obj.range;
    this.className = function () { return 'Vision'; }
};