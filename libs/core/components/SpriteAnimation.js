ns('boc.components');

// Specifically animates a Drawable Sprite
// sprites {array}, easing {string}, duration {number}
boc.components.SpriteAnimation = function(obj) {
    this.sprites = obj.sprites;
    this.easing = obj.easing || 'linear';
    this.state = obj.state || boc.constants.ANIMATION_STOPPED;
    this.duration = obj.duration;
    this.elapsedTime = 0;
    this.currentFrame = 0;        
    this.className = function () { return 'SpriteAnimation'; }
    var _em = new boc.utils.EventManager;
    this.notify = _em.notify;
    this.addListener = _em.addListener;
    this.removeListener = _em.removeListener;
};