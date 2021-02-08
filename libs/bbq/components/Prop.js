ns('bbq.components');
// type {string}
bbq.components.Prop = function(obj) {
    this.type = obj.type;
    this.className = function () { return 'Prop'; }
};