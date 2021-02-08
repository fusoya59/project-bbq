ns('boc.components');

// simple rectangle drawable
// fillStyle {sting}, strokeStyle {string}, lineWidth {int}, alpha {float, [0.0-1.0]}, visible {bool}
boc.components.DrawableRect = function (obj) {
    this.fillStyle = obj.fillStyle || 'red';
    this.strokeStyle = obj.strokeStyle || 'black';
    this.lineWidth = obj.lineWidth != undefined && obj.lineWidth != null ? obj.lineWidth : 1;
    this.alpha = typeof (obj.alpha) != 'undefined' && obj.alpha != null ? obj.alpha : 1.0;
    this.visible = obj.visible != undefined && obj.visible != null ? obj.visible : true;
    this.className = function () { return 'DrawableRect'; }

    var evm = new boc.utils.EventManager(this);
};