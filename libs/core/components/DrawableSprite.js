ns('boc.components');

// simple Image
// image {Image}, clipRect {object}, alpha {float, [0.0, 1.0]}, visible {bool}
boc.components.DrawableSprite = function (obj) {
    this.image = obj.image;
    this.clipRect = obj.clipRect;
    this.alpha = obj.alpha || 1.0;
    this.visible = obj.visible != undefined && obj.visible != null ? obj.visible : true;
    this.className = function () { return 'DrawableSprite'; }
    var evm = new boc.utils.EventManager(this);
}; // DrawableSprite