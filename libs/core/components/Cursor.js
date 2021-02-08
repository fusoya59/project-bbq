ns('boc.components');
// cursor for choosing entities
// target {string}, enabled {bool}, location {object}
boc.components.Cursor = function (obj) {
    this.target = obj.target; // string, entity
    this.enabled = obj.enabled || true;
    this.location = obj.location; // { x, y }
    this.className = function () { return 'Cursor'; }
};