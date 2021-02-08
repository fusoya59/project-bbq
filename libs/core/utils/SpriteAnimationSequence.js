ns('boc.utils');

// same as animation sequence but specifically for sprites
boc.utils.SpriteAnimationSequence = function (p) {
    var em = p.entityManager || boc.utils._em;
    var _entity = p.entity;
    if (typeof (_entity) != 'string') {
        _entity = _entity.id();
    }
    var _animations = p.animations;
    var _loop = p.loop != null && p.loop != undefined ? p.loop : false;
    var _stop = false;
    var _lastIndex = 0;

    function onComplete(eventArgs) {
        if (_stop) { return; }

        _lastIndex++;
        if (_lastIndex >= _animations.length) {
            if (p.onLoopComplete) { p.onLoopComplete(); }
            if (!_loop) {
                return;
            }
            else {
                _lastIndex = 0;
            }
        }
        thisAnimationComponent.elapsedTime = 0;
        thisAnimationComponent.state = boc.constants.ANIMATION_PLAYING;
        thisAnimationComponent.sprites = _animations[_lastIndex].sprites;
        thisAnimationComponent.easing = _animations[_lastIndex].easing;
        thisAnimationComponent.duration = _animations[_lastIndex].duration;
        thisAnimationComponent.currentFrame = 0;
    } // onComplete

    var thisAnimationComponent = new boc.components.SpriteAnimation({});
    thisAnimationComponent.addListener('onComplete', onComplete);
    thisAnimationComponent.sprites = _animations[0].sprites;
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
        var currAnimationComponent = em.getComponentForEntity('SpriteAnimation', _entity);
        if (currAnimationComponent) {
            em.removeComponentFromEntity('SpriteAnimation', _entity);
        }
        thisAnimationComponent.state = boc.constants.ANIMATION_PLAYING;
        em.addComponentToEntity(thisAnimationComponent, _entity);
    };
}; //SpriteAnimation