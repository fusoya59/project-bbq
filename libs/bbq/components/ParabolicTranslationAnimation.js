ns('bbq.components');
// dx {number}, dy {number}, easing {string}, height {int}, duration {number}
bbq.components.ParabolicTranslationAnimation = function (obj) {
    this.dx = obj.dx;
    this.dy = obj.dy;
    this.easing = obj.easing || 'linearTween';
    this.height = obj.height || 70;
    this.duration = obj.duration;
    this.elapsedTime = 0;
    this.state = obj.state || boc.constants.ANIMATION_STOPPED;
    this.className = function () { return 'ParabolicTranslationAnimation'; }

    var _em = new boc.utils.EventManager;
    this.notify = _em.notify;
    this.addListener = _em.addListener;
    this.removeListener = _em.removeListener;
};