ns('boc.components');
// clickable
boc.components.Identifiable = function () {
    this.hot = true;
    this.className = function () { return 'Identifiable'; }
};