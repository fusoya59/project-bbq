ns('boc.components');

// animation definition that can animate mostly any component property
// componentName {string}, propertyDeltas {object}, easing {string}, duration {number}, state {string}
// emits : 'onComplete'
boc.components.Animation = function (obj) {
    this.componentName = obj.componentName || null; // 
    this.propertyDeltas = obj.propertyDeltas || {}; // { property : delta } 
    this.easing = obj.easing || 'linearTween';
    this.duration = obj.duration || 0;
    this.elapsedTime = 0;
    this.state = obj.state || boc.constants.ANIMATION_STOPPED;                       
    this.className = function () { return 'Animation'; }
    var _em = new boc.utils.EventManager;
    this.notify = _em.notify;
    this.addListener = _em.addListener;
    this.removeListener = _em.removeListener;
};