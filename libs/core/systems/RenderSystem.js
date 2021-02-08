ns('boc.systems');

// renders all drawable components
boc.systems.RenderSystem = function (entityManager, canvas, cam) {
    var context = canvas.getContext('2d');
    var em = entityManager;

    // binary search/insert
    function insert(arr, startIndex, lastIndex, z, payload) {
        if (arr.length == 0) {
            arr.push({ z: z, payload: [payload] });
        }
        else {
            var midIndex = startIndex + Math.floor((lastIndex - startIndex) / 2);
            var midEle = arr[midIndex];

            if (lastIndex < startIndex) {
                arr.splice(startIndex, 0, { z: z, payload: [payload] });
                return;
            }

            // i found it, push the payload
            if (midEle.z == z) {
                midEle.payload.push(payload);
            }
            else if (z < midEle.z) {
                insert(arr, startIndex, midIndex - 1, z, payload);
            }
            else if (z > midEle.z) {
                insert(arr, midIndex + 1, lastIndex, z, payload);
            }
        }
    }

    var _camera = null;
    this.camera = function (camera) {
        if (camera == undefined) { return _camera; }
        _camera = camera;
    };
    this.camera(cam);

    var _debug = 2; // i leave this here cuz i have yet to determine which is faster : debug = 0 (native sort) or debug = 2 (binary search tree)
    this.debug = function (d) {
        if (d == undefined) { return d; }
        _debug = d;
    }

    this.processTick = function (frameTime) {
        var sw = new boc.utils.Stopwatch();
        //sw.start();
        var drawableComponents = boc.components.drawables;
        var zOrderedEntities = [];
        context.save();
        context.translate(-_camera.xmin, -_camera.ymin);
        context.scale(_camera.zoom, _camera.zoom);

        var excludeEnts = [];
        for (var c = 0; c < drawableComponents.length; c++) {

            var drawableEnts = em.getAllEntitiesWithComponent(drawableComponents[c]);

            for (var d = 0; d < drawableEnts.length; d++) {
                var drawableEnt = drawableEnts[d];

                // speedhack, but worth it
                var drawableComponent = em.getComponentForEntity(drawableComponents[c], drawableEnt);
                var spineDrawable = em.getComponentForEntity('SpineDrawable', drawableEnt);
                var skip = false;
                for (var k = 0; k < excludeEnts.length; k++) {
                    if (excludeEnts[k] === drawableEnt) {
                        skip = true;
                        break;
                    }
                }
                if (skip) {
                    continue;
                }
                //if (excludeEnts.indexOf(drawableEnt) >= 0) {
                //    continue;
                //}
                if (drawableComponent.className() == 'DrawableSprite' && spineDrawable) {
                    excludeEnts.push(drawableEnt);
                }

                var spatialComponent = em.getComponentForEntity('Spatial', drawableEnt);


                if (drawableComponent.visible && _camera.intersects(boc.utils.toBounds(spatialComponent))) {
                    if (_debug == 2) {
                        insert(zOrderedEntities, 0, zOrderedEntities.length - 1, spatialComponent.z, drawableEnt);
                    }
                    else {
                        zOrderedEntities.push(drawableEnt);
                    }
                } // intersect check
            } // d
        } // c

        // TODO: gotta decide which one's more optimal. i'm leaning towards the binary tree, but we'll see.
        if (_debug == 2) {
            for (var j = 0; j < zOrderedEntities.length; j++) {
                var zOrderedEntitiesPayload = zOrderedEntities[j].payload;
                for (var k = 0; k < zOrderedEntitiesPayload.length; k++) {
                    var drawableComponent = null;
                    for (var c = 0; c < drawableComponents.length; c++) {
                        drawableComponent = em.getComponentForEntity(drawableComponents[c], zOrderedEntitiesPayload[k]);
                        if (!drawableComponent) { continue; }
                        var spatialComponent = em.getComponentForEntity('Spatial', zOrderedEntitiesPayload[k]);

                        if (drawableComponent.className() == 'DrawableRect') {
                            context.save();
                            var transform = em.getComponentForEntity('Transformable', zOrderedEntitiesPayload[k]);
                            if (transform) {
                                for (var t = 0; t < transform.transforms.length; t++) {
                                    transform.transforms[t](zOrderedEntities[j], context);
                                }
                            }
                            if (spatialComponent.angle !== 0) {
                                context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                                context.rotate(spatialComponent.angle);
                                context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                            }
                            if (spatialComponent.scale != 1.0) {
                                context.scale(spatialComponent.scale, spatialComponent.scale);
                                var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                                var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                                context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                            }
                            context.fillStyle = drawableComponent.fillStyle;
                            context.globalAlpha = drawableComponent.alpha;
                            context.fillRect(spatialComponent.x, spatialComponent.y, spatialComponent.width, spatialComponent.height);
                            if (drawableComponent.lineWidth > 0) {
                                context.strokeStyle = drawableComponent.strokeStyle;
                                context.lineWidth = drawableComponent.lineWidth;
                                context.strokeRect(spatialComponent.x + context.lineWidth / 2, spatialComponent.y + context.lineWidth / 2, spatialComponent.width - context.lineWidth, spatialComponent.height - context.lineWidth);
                            }
                            context.restore();
                            break;
                        }
                        else if (drawableComponent.className() == 'FunkyDrawableRect') {
                            context.save();
                            var frame = Math.round(drawableComponent.currentFrame);
                            var transform = em.getComponentForEntity('Transformable', zOrderedEntitiesPayload[k]);
                            if (transform) {
                                for (var t = 0; t < transform.transforms.length; t++) {
                                    transform.transforms[t](zOrderedEntities[j], context);
                                }
                            }
                            context.fillStyle = drawableComponent.fillStyles[frame];
                            context.fillRect(spatialComponent.x, spatialComponent.y, spatialComponent.width, spatialComponent.height);
                            if (drawableComponent.lineWidths[frame] > 0) {
                                context.strokeStyle = drawableComponent.strokeStyles[frame];
                                context.lineWidth = drawableComponent.lineWidths[frame];
                                context.strokeRect(spatialComponent.x + context.lineWidth / 2, spatialComponent.y + context.lineWidth / 2, spatialComponent.width - context.lineWidth, spatialComponent.height - context.lineWidth);
                            }
                            context.restore();
                            break;
                        }
                        else if (drawableComponent.className() == 'DrawableSprite') {

                            context.save();
                            var transform = em.getComponentForEntity('Transformable', zOrderedEntitiesPayload[k]);
                            if (transform) {
                                for (var t = 0; t < transform.transforms.length; t++) {
                                    transform.transforms[t](zOrderedEntities[j], context);
                                }
                            }
                            //if (!drawableComponent.clipRect) {
                            //    drawableComponent.clipRect = {
                            //        x: 0,
                            //        y: 0,
                            //        width: spatialComponent.width,
                            //        height: spatialComponent.height
                            //    };
                            //}
                            if (spatialComponent.angle !== 0) {
                                context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                                context.rotate(spatialComponent.angle);
                                context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                            }
                            if (spatialComponent.scale != 1.0) {
                                context.scale(spatialComponent.scale, spatialComponent.scale);
                                var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                                var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                                context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                            }
                            context.globalAlpha = drawableComponent.alpha;
                            if (!drawableComponent.clipRect) {
                                try {
                                    context.drawImage(drawableComponent.image,
                                        spatialComponent.x,
                                        spatialComponent.y,
                                        spatialComponent.width,
                                        spatialComponent.height
                                    );
                                } catch (err) {
                                    console.log(zOrderedEntitiesPayload[k], ' image bad');
                                }
                            }
                            else {
                                context.drawImage(drawableComponent.image,
                                    drawableComponent.clipRect.x,
                                    drawableComponent.clipRect.y,
                                    drawableComponent.clipRect.width,
                                    drawableComponent.clipRect.height,
                                    spatialComponent.x,
                                    spatialComponent.y,
                                    spatialComponent.width,
                                    spatialComponent.height
                                );
                            }

                            if (spatialComponent.angle !== 0) {
                                context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                            }

                            context.restore();
                            break;
                        }
                        else if (drawableComponent.className() == 'DrawableText') {
                            context.save();
                            var transform = em.getComponentForEntity('Transformable', zOrderedEntitiesPayload[k]);
                            if (transform) {
                                for (var t = 0; t < transform.transforms.length; t++) {
                                    transform.transforms[t](zOrderedEntities[j], context);
                                }
                            }
                            context.font = drawableComponent.font;
                            if (spatialComponent.angle !== 0) {
                                context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                                context.rotate(spatialComponent.angle);
                                context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                            }
                            if (spatialComponent.scale != 1.0) {
                                context.scale(spatialComponent.scale, spatialComponent.scale);
                                var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                                var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                                context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                            }
                            if (drawableComponent.shadow) {
                                context.fillStyle = 'black';
                                context.fillText(
                                    drawableComponent.text,
                                    spatialComponent.x + drawableComponent.shadow.x + drawableComponent.offset.x,
                                    spatialComponent.y + drawableComponent.shadow.y + drawableComponent.offset.y
                                );
                            }
                            context.fillStyle = drawableComponent.fillStyle;
                            context.fillText(
                                drawableComponent.text,
                                spatialComponent.x + drawableComponent.offset.x,
                                spatialComponent.y + drawableComponent.offset.y
                            );
                            context.restore();
                            break;
                        }
                        else if (drawableComponent.className() == 'SpineDrawable' && boc && boc.spine && boc.spine.renderSkeleton) {
                            context.save();
                            context.translate(spatialComponent.x, spatialComponent.y);
                            if (spatialComponent.angle !== 0) {
                                //context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                                context.rotate(spatialComponent.angle);
                                //context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                            }
                            //if (spatialComponent.scale != 1.0) {
                            if (spatialComponent.scaleX != 1.0 && spatialComponent.scaleY != 1.0) {
                                //context.scale(spatialComponent.scale, spatialComponent.scale);
                                //var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                                //var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                                //context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                                context.scale(spatialComponent.scaleX, spatialComponent.scaleY);
                            }
                            boc.spine.renderSkeleton(drawableComponent.skeleton, context);
                            context.restore();
                            break;
                        }
                    } // c                                                
                } // k                        
            } // j
        } // debug 1
        else if (_debug == 0) {
            zOrderedEntities.sort(function (a, b) {
                var spatialA = em.getComponentForEntity('Spatial', a);
                var spatialB = em.getComponentForEntity('Spatial', b);
                return (spatialA.z - spatialB.z);
            });

            for (var j = 0; j < zOrderedEntities.length; j++) {
                var drawableComponent = null;
                for (var c = 0; c < drawableComponents.length; c++) {
                    drawableComponent = em.getComponentForEntity(drawableComponents[c], zOrderedEntities[j]);
                    if (!drawableComponent) { continue; }

                    var spatialComponent = em.getComponentForEntity('Spatial', zOrderedEntities[j]);

                    if (drawableComponent.className() == 'DrawableRect') {
                        context.save();
                        var transform = em.getComponentForEntity('Transformable', zOrderedEntities[j]);
                        if (transform) {
                            for (var t = 0; t < transform.transforms.length; t++) {
                                transform.transforms[t](zOrderedEntities[j], context);
                            }
                        }
                        if (spatialComponent.angle !== 0) {
                            context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                            context.rotate(spatialComponent.angle);
                            context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                        }
                        if (spatialComponent.scale != 1.0) {
                            context.scale(spatialComponent.scale, spatialComponent.scale);
                            var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                            var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                            context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                        }
                        context.fillStyle = drawableComponent.fillStyle;
                        context.globalAlpha = drawableComponent.alpha;
                        context.fillRect(spatialComponent.x, spatialComponent.y, spatialComponent.width, spatialComponent.height);
                        if (drawableComponent.lineWidth > 0) {
                            context.strokeStyle = drawableComponent.strokeStyle;
                            context.lineWidth = drawableComponent.lineWidth;
                            context.strokeRect(spatialComponent.x + context.lineWidth / 2, spatialComponent.y + context.lineWidth / 2, spatialComponent.width - context.lineWidth, spatialComponent.height - context.lineWidth);
                        }
                        context.restore();
                        break;
                    }
                    else if (drawableComponent.className() == 'FunkyDrawableRect') {
                        context.save();
                        var frame = Math.round(drawableComponent.currentFrame);
                        var transform = em.getComponentForEntity('Transformable', zOrderedEntities[j]);
                        if (transform) {
                            for (var t = 0; t < transform.transforms.length; t++) {
                                transform.transforms[t](zOrderedEntities[j], context);
                            }
                        }
                        context.fillStyle = drawableComponent.fillStyles[frame];
                        context.fillRect(spatialComponent.x, spatialComponent.y, spatialComponent.width, spatialComponent.height);
                        if (drawableComponent.lineWidths[frame] > 0) {
                            context.strokeStyle = drawableComponent.strokeStyles[frame];
                            context.lineWidth = drawableComponent.lineWidths[frame];
                            context.strokeRect(spatialComponent.x + context.lineWidth / 2, spatialComponent.y + context.lineWidth / 2, spatialComponent.width - context.lineWidth, spatialComponent.height - context.lineWidth);
                        }
                        context.restore();
                        break;
                    }
                    else if (drawableComponent.className() == 'DrawableSprite') {

                        context.save();
                        //if (!drawableComponent.clipRect) {
                        //    drawableComponent.clipRect = {
                        //        x: 0,
                        //        y: 0,
                        //        width: spatialComponent.width,
                        //        height: spatialComponent.height
                        //    };
                        //}                        
                        var transform = em.getComponentForEntity('Transformable', zOrderedEntities[j]);
                        if (transform) {
                            for (var t = 0; t < transform.transforms.length; t++) {
                                transform.transforms[t](zOrderedEntities[j], context);
                            }
                        }
                        if (spatialComponent.angle !== 0) {
                            context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                            context.rotate(spatialComponent.angle);
                            context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                        }
                        if (spatialComponent.scale != 1.0) {
                            context.scale(spatialComponent.scale, spatialComponent.scale);
                            var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                            var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                            context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                        }

                        context.globalAlpha = drawableComponent.alpha;
                        if (!drawableComponent.clipRect) {
                            context.drawImage(drawableComponent.image,
                                spatialComponent.x,
                                spatialComponent.y,
                                spatialComponent.width,
                                spatialComponent.height
                            );
                        }
                        else {
                            context.drawImage(drawableComponent.image,
                                drawableComponent.clipRect.x,
                                drawableComponent.clipRect.y,
                                drawableComponent.clipRect.width,
                                drawableComponent.clipRect.height,
                                spatialComponent.x,
                                spatialComponent.y,
                                spatialComponent.width,
                                spatialComponent.height
                            );
                        }
                        //if (spatialComponent.angle !== 0) {
                        //    context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                        //}

                        context.restore();
                        break;
                    }
                    else if (drawableComponent.className() == 'DrawableText') {
                        context.save();
                        var transform = em.getComponentForEntity('Transformable', zOrderedEntities[j]);
                        if (transform) {
                            for (var t = 0; t < transform.transforms.length; t++) {
                                transform.transforms[t](zOrderedEntities[j], context);
                            }
                        }
                        context.font = drawableComponent.font;
                        if (spatialComponent.angle !== 0) {
                            context.translate(spatialComponent.x + spatialComponent.width / 2, spatialComponent.y + spatialComponent.height / 2);
                            context.rotate(spatialComponent.angle);
                            context.translate(-spatialComponent.x - spatialComponent.width / 2, -spatialComponent.y - spatialComponent.height / 2);
                        }
                        if (spatialComponent.scale != 1.0) {
                            context.scale(spatialComponent.scale, spatialComponent.scale);
                            var dx = spatialComponent.x * spatialComponent.scale - spatialComponent.x;
                            var dy = spatialComponent.y * spatialComponent.scale - spatialComponent.y;
                            context.translate(-dx / spatialComponent.scale, -dy / spatialComponent.scale);
                        }
                        if (drawableComponent.shadow) {
                            context.fillStyle = 'black';
                            context.fillText(
                                drawableComponent.text,
                                spatialComponent.x + drawableComponent.shadow.x + drawableComponent.offset.x,
                                spatialComponent.y + drawableComponent.shadow.y + drawableComponent.offset.y
                            );
                        }

                        context.fillStyle = drawableComponent.fillStyle;
                        context.fillText(
                            drawableComponent.text,
                            spatialComponent.x + drawableComponent.offset.x,
                            spatialComponent.y + drawableComponent.offset.y
                        );
                        context.restore();
                        break;
                    }
                    else if (drawableComponent.className() == 'SpineDrawable' && boc && boc.spine && boc.spine.renderSkeleton) {
                        context.save();
                        boc.spine.renderSkeleton(drawableComponent.skeleton, context);
                        context.restore();
                        break;
                    }
                } // c                    
            } // j
        } // debug 0
        context.restore();
    }; //processTick
}; // RenderSystem