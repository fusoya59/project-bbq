ns('boc.utils');

// helper class to run a sequence of animations
// { entity, loop, animations[], onAnimationComplete[] }
boc.utils.AnimationSequence = function (params) {
    var _entity = params.entity;
    if (typeof (_entity) == 'string') {
        _entity = new boc.core.Entity({ id: _entity });
    }
    var _animations = params.animations;
    var _loop = params.loop != null && params.loop != undefined ? params.loop : false;
    var _stop = false;
    var _lastIndex = 0;

    function onComplete(eventArgs) {
        if (_stop) { return; }
        //if (_loop) {
        _lastIndex++;
        if (_lastIndex >= _animations.length) {
            if (params.onLoopComplete) { params.onLoopComplete(); }
            if (!_loop) {
                return;
            }
            else {
                _lastIndex = 0;
            }
        }
        thisAnimationComponent.elapsedTime = 0;
        thisAnimationComponent.state = boc.constants.ANIMATION_PLAYING;
        thisAnimationComponent.componentName = _animations[_lastIndex].componentName;
        thisAnimationComponent.propertyDeltas = _animations[_lastIndex].propertyDeltas;
        thisAnimationComponent.easing = _animations[_lastIndex].easing;
        thisAnimationComponent.duration = _animations[_lastIndex].duration;
        //}
    } // onComplete

    var thisAnimationComponent = new boc.components.Animation({});
    thisAnimationComponent.addListener('onComplete', onComplete);
    if (params.onAnimationComplete) {
        var listeners = params.onAnimationComplete instanceof Array ? params.onAnimationComplete : [params.onAnimationComplete];
        for (var i = 0; i < listeners.length; i++) {
            thisAnimationComponent.addListener('onComplete', listeners[i]);
        }
    }
    thisAnimationComponent.componentName = _animations[0].componentName;
    thisAnimationComponent.propertyDeltas = _animations[0].propertyDeltas;
    thisAnimationComponent.easing = _animations[0].easing;
    thisAnimationComponent.duration = _animations[0].duration;

    // stops it forever
    this.stop = function () {
        _stop = true;
        thisAnimationComponent.state = boc.constants.ANIMATION_STOPPED;
    };

    this.pause = function () {
        thisAnimationComponent.state = boc.constants.ANIMATION_PAUSED;
    }

    // starts it forever
    this.start = function () {
        _stop = false;
        var currAnimationComponent = _entity.Animation;
        if (currAnimationComponent) {
            _entity.removeComponent('Animation');
        }
        _entity.addComponent(thisAnimationComponent);
        thisAnimationComponent.state = boc.constants.ANIMATION_PLAYING;
        //runAnimation(_lastIndex);
    };
}; //AnimationSequence