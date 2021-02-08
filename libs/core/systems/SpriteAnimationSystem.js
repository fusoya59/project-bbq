ns('boc.systems');

// specifically animates DrawableSprites w/ SpriteAnimation component
boc.systems.SpriteAnimationSystem = function (em) {
    this.processTick = function (frameTime) {
        //frameTime = this.speed ? frameTime * this.speed : frameTime;
        var spriteAnimationEntities = em.getAllEntitiesWithComponent('SpriteAnimation');
        for (var i = 0; i < spriteAnimationEntities.length; i++) {
            var spriteAnimationEntity = spriteAnimationEntities[i];
            var spriteAnimation = em.getComponentForEntity('SpriteAnimation', spriteAnimationEntity);
            if (spriteAnimation.state != boc.constants.ANIMATION_PLAYING) { continue; }
            var drawableSprite = em.getComponentForEntity('DrawableSprite', spriteAnimationEntity);
            var delta = spriteAnimation.sprites.length * (frameTime / spriteAnimation.duration);
            spriteAnimation.elapsedTime += frameTime;
            if (spriteAnimation.elapsedTime >= spriteAnimation.duration) {
                spriteAnimation.state = boc.constants.ANIMATION_COMPLETE;
                spriteAnimation.currentFrame = spriteAnimation.sprites.length - 1;
                var spriteAnimationDrawableSprite = spriteAnimation.sprites[spriteAnimation.currentFrame];
                //drawableSprite.image = spriteAnimationDrawableSprite.image;
                //drawableSprite.clipRect = spriteAnimationDrawableSprite.clipRect;
                //drawableSprite.alpha = spriteAnimationDrawableSprite.alpha;
                drawableSprite.update('image', spriteAnimationDrawableSprite.image);
                drawableSprite.update('clipRect', spriteAnimationDrawableSprite.clipRect);
                drawableSprite.update('alpha', spriteAnimationDrawableSprite.alpha);
                spriteAnimation.notify('onComplete', { entity: spriteAnimationEntity });
            } else {
                spriteAnimation.state = boc.constants.ANIMATION_PLAYING;
                spriteAnimation.currentFrame += delta;
                var spriteAnimationDrawableSprite = spriteAnimation.sprites[Math.floor(spriteAnimation.currentFrame)];
                //drawableSprite.image = spriteAnimationDrawableSprite.image;
                //drawableSprite.clipRect = spriteAnimationDrawableSprite.clipRect;
                //drawableSprite.alpha = spriteAnimationDrawableSprite.alpha;                    
                drawableSprite.update('image', spriteAnimationDrawableSprite.image);
                drawableSprite.update('clipRect', spriteAnimationDrawableSprite.clipRect);
                drawableSprite.update('alpha', spriteAnimationDrawableSprite.alpha);
            }
        } //i
    }; // processTick
}; //SpriteAnimationSystem