ns('boc.systems');

// animates an entity's component
boc.systems.AnimationSystem = function (entityManager) {
    var em = entityManager;
    this.processTick = function (frameTime) {
        //frameTime = this.speed ? frameTime * this.speed : frameTime;
        var animationComponents = ['Animation', 'FrameAnimation'];

        for (var c = 0; c < animationComponents.length; c++) {
            var animationEntities = em.getAllEntitiesWithComponent(animationComponents[c]);
            //var completedEntities = [];
            for (var i = 0; i < animationEntities.length; i++) {

                //var animationEntity = new boc.core.Entity({ id :animationEntities[i] });
                var animationComponent = em.getComponentForEntity(animationComponents[c], animationEntities[i]);
                if (animationComponent.state != boc.constants.ANIMATION_PLAYING) { continue; }

                var targetComponent = em.getComponentForEntity(animationComponent.componentName, animationEntities[i]);

                // assume linear for now
                if (animationComponent.elapsedTime == 0) {
                    animationComponent._startValue = {};
                    animationComponent._finalValue = {};
                    for (var j in animationComponent.propertyDeltas) {
                        animationComponent._startValue[j] = targetComponent[j];
                        animationComponent._finalValue[j] = targetComponent[j] + animationComponent.propertyDeltas[j];
                    }
                }

                //swComplete.start();
                // Spatial is special...
                if (animationComponent.componentName == 'Spatial') {
                    var deltaObj = {};
                    for (var j in animationComponent.propertyDeltas) {
                        //var delta = animationComponent.propertyDeltas[j] * (frameTime / animationComponent.duration);
                        //deltaObj[j] = targetComponent[j] + delta;
                        var easingFn = Math[animationComponent.easing] || Math.linearTween;
                        var newValue = easingFn(animationComponent.elapsedTime, animationComponent._startValue[j], animationComponent.propertyDeltas[j], animationComponent.duration);
                        deltaObj[j] = newValue;
                    } // j
                    //swComplete.start();
                    targetComponent.update(deltaObj);
                    //swComplete.stop();
                } else {
                    for (var j in animationComponent.propertyDeltas) {
                        //var delta = animationComponent.propertyDeltas[j] * (frameTime / animationComponent.duration);
                        //targetComponent[j] = targetComponent[j] + delta;
                        var easingFn = Math[animationComponent.easing] || Math.linearTween;
                        var newValue = easingFn(animationComponent.elapsedTime, animationComponent._startValue[j], animationComponent.propertyDeltas[j], animationComponent.duration);
                        targetComponent[j] = newValue;
                    } // j 
                }
                //swComplete.stop();

                animationComponent.elapsedTime += frameTime;
                if (animationComponent.elapsedTime >= animationComponent.duration) {
                    var deltaObj = {};
                    if (animationComponent.componentName == 'Spatial') {
                        for (var j in animationComponent.propertyDeltas) {
                            deltaObj[j] = animationComponent._finalValue[j];
                        } // j
                        targetComponent.update(deltaObj);
                    }
                    else {
                        for (var j in animationComponent.propertyDeltas) {
                            targetComponent[j] = animationComponent._finalValue[j];
                        } // j
                    }
                    animationComponent.state = boc.constants.ANIMATION_COMPLETE;
                    animationComponent.notify('onComplete', { entity: animationEntities[i] });
                }
            } // i                                             
        } // c             
    } // processTick
}; //AnimationSystem