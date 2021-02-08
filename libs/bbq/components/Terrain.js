ns('bbq.components');
// type {string}
bbq.components.Terrain = function(obj) {
    this.type = obj.type;
    this.className = function () { return 'Terrain'; }
};