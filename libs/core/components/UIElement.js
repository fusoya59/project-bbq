ns('boc.components');
// onclick {function}
boc.components.UIElement = function (p) {
    this.onclick = p.onclick;
    this.className = function () { return 'UIElement'; }
} 