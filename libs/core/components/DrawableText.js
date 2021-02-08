ns('boc.components');

// simple text. note: this is a heavy draw oeration.
// fillStyle {string}, font {string}, shadow {object}, offset {object}, text {string}, visible {bool}
boc.components.DrawableText = function (p) {
    this.fillStyle = p.fillStyle;
    this.font = p.font || 'bold 8pt Helvetica';
    this.shadow = p.shadow; // { x, y } pixels
    this.offset = p.offset || { x: 0, y: 0 };
    this.text = p.text;
    this.visible = p.visible != undefined && p.visible != null ? p.visible : true;
    this.className = function () { return 'DrawableText'; }
    var evm = new boc.utils.EventManager(this);
};