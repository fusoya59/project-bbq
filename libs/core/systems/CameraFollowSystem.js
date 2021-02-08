ns('boc.systems');

// makes an entity follow the camera
boc.systems.CameraFollowSystem = function (em) {
    this.processTick = function (frameTime) {
        var followableEntities = em.getAllEntitiesWithComponent('CameraFollow');
        for (var i = 0; i < followableEntities.length; i++) {
            if (!em.getComponentForEntity('CameraFollow', followableEntities[i]).onCameraChange) {
                (function (followableEntity) {
                    var cameraFollow = em.getComponentForEntity('CameraFollow', followableEntity);
                    var spatial = em.getComponentForEntity('Spatial', followableEntity);

                    //function unscale(en, ctx) {
                    //    ctx.scale(1 / cameraFollow.camera.zoom, 1 / cameraFollow.camera.zoom);
                    //}

                    cameraFollow.onCameraChange = function (cameraArgs) {
                        var dx = (cameraArgs.oldCamera.xmin - cameraArgs.newCamera.xmin) / cameraArgs.newCamera.zoom;
                        var dy = (cameraArgs.oldCamera.ymin - cameraArgs.newCamera.ymin) / cameraArgs.newCamera.zoom;
                        //if (cameraArgs.oldCamera.zoom != cameraArgs.newCamera.zoom) {
                        //    //var oldWidth = cameraArgs.oldCamera.xmax - cameraArgs.oldCamera.xmin,
                        //    //    oldHeight = cameraArgs.oldCamera.ymax - cameraArgs.oldCamera.ymin,
                        //    //    newWidth = cameraArgs.newCamera.xmax - cameraArgs.newCamera.xmin,
                        //    //    newHeight = cameraArgs.newCamera.ymax - cameraArgs.newCamera.ymin;

                        //    //// what's my relative position wrt the old camera ?
                        //    //var relativeX = (spatial.x - cameraArgs.oldCamera.xmin) / oldWidth,
                        //    //    relativeY = (spatial.y - cameraArgs.oldCamera.ymin) / oldHeight;

                        //    //// calculate my new position wrt to the new camera
                        //    //spatial.update({
                        //    //    x: newWidth * relativeX + cameraArgs.newCamera.xmin,
                        //    //    y: newHeight * relativeY + cameraArgs.newCamera.ymin
                        //    //});

                        //    var transformable = $em(followableEntity).comp('Transformable');
                        //    if (!transformable) {
                        //        transformable = new boc.components.Transformable();
                        //        transformable.transforms.push(unscale);
                        //        $em(followableEntity).add(transformable);
                        //    }
                        //    if (transformable.transforms.indexOf(unscale) == -1) {
                        //        transformable.transforms.push(unscale);
                        //    }
                        //    //dx *= cameraArgs.newCamera.zoom;
                        //    //dy *= cameraArgs.newCamera.zoom;
                        //}
                        spatial.update({
                            x: spatial.x - dx,
                            y: spatial.y - dy
                        });
                    };
                    cameraFollow.camera.addListener('onchange', cameraFollow.onCameraChange);

                    cameraFollow.onCameraRemoved = function (removedArgs) {
                        if (removedArgs.componentName == 'CameraFollow') {
                            //var transformable = $em(followableEntity).comp('Transformable');
                            //if (transformable) {
                            //    var unscaleIndex = transformable.transforms.indexOf(unscale);
                            //    if (unscaleIndex >= 0) {
                            //        transformable.transforms.splice(unscale);
                            //    }
                            //}
                            cameraFollow.camera.removeListener('onchange', cameraFollow.onCameraChange);
                            delete followableEntity['onCameraChange'];
                            em.removeListenerForEntity(followableEntity, 'onComponentRemoved', cameraFollow.onCameraRemoved);
                            delete followableEntity['onCameraRemoved'];
                        }
                    };
                    em.addListenerForEntity(followableEntity, 'onComponentRemoved', cameraFollow.onCameraRemoved);
                })(followableEntities[i]);
            }
        } // i
    }; // processTick
}; // CameraFollowSystem