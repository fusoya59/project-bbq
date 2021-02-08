ns('boc.systems');

// moves the camera on mouse drag    
boc.systems.PanningCameraSystem = function (entityManager, camera) {
    var em = entityManager;

    var _mouseState = 'idle';
    var _drag_pid = null;
    var _dragThreshold = 50; // ms
    var _prevX = null, _prevY = null;

    var _bounds = null;
    this.bounds = function (bounds) {
        if (bounds == undefined) { return _bounds; }
        _bounds = bounds;
    }; // setbounds

    var _locked = false;
    //var k = 0;
    this.processTick = function (frameTime) {
        $em('PanningCameraEvent').each(function (e, c) {
            if (c.action == 'lock') {
                _locked = true;
                boc.utils.consumeEvent(e, c.className(), em);
            }
            else if (c.action == 'unlock') {
                _locked = false;
                boc.utils.consumeEvent(e, c.className(), em);
            }
        });
        if (_locked) { return; }
        //if (k++ % 100 == 0) { console.log(_mouseState); }
        var ents = em.getAllEntitiesWithComponent('MouseEvent');
        if (ents && ents.length > 0) {
            ents = ents.slice();
            ents.sort(function (a, b) {
                var mevA = em.getComponentForEntity('MouseEvent', a);
                var mevB = em.getComponentForEntity('MouseEvent', b);
                return (mevA.timestamp - mevB.timestamp);
            });
            for (var i = 0; i < ents.length; i++) {
                var mouseEventComponent = em.getComponentForEntity('MouseEvent', ents[i]);
                var lifespanComponent = em.getComponentForEntity('Lifespan', ents[i]);
                if (lifespanComponent.duration == 0) { continue; }
                lifespanComponent.duration = 0;
                //console.log(mouseEventComponent.action);

                if (mouseEventComponent.action == 'mouseup' || mouseEventComponent.action == 'onblur') {
                    _mouseState = 'idle';
                    //console.log(_mouseState);
                    if (_drag_pid != null && typeof (_drag_pid) != 'undefined') {
                        clearTimeout(_drag_pid);
                        _drag_pid = null;
                    }
                    _prevX = null;
                    _prevY = null;
                }
                else if (mouseEventComponent.action == 'mousedrag') {
                    if (_drag_pid == null) {
                        _drag_pid = setTimeout(function () {
                            _mouseState = 'drag';
                        }, _dragThreshold);
                    }
                    // don't handle drag events until the threshold is up
                    if (_mouseState == 'drag') {
                        if (_prevX && _prevY) {
                            var dx = _prevX - (mouseEventComponent.stateObj.clientX - mouseEventComponent.element.offsetLeft);
                            var dy = _prevY - (mouseEventComponent.stateObj.clientY - mouseEventComponent.element.offsetTop);
                            camera.move(dx, dy);
                            if (_bounds) {
                                dx = 0;
                                dy = 0;

                                if (camera.xmin / camera.zoom < _bounds.xmin) { dx = _bounds.xmin - camera.xmin / camera.zoom; }
                                else if (camera.xmax / camera.zoom > _bounds.xmax) { dx = _bounds.xmax - camera.xmax / camera.zoom; }
                                if (camera.ymin / camera.zoom < _bounds.ymin) { dy = _bounds.ymin - camera.ymin / camera.zoom; }
                                else if (camera.ymax / camera.zoom > _bounds.ymax) { dy = _bounds.ymax - camera.ymax / camera.zoom; }
                                camera.move(dx, dy);
                            }

                        }
                        _prevX = mouseEventComponent.stateObj.clientX - mouseEventComponent.element.offsetLeft;
                        _prevY = mouseEventComponent.stateObj.clientY - mouseEventComponent.element.offsetTop;

                    }
                } // drag              

            }// i
        }
    } // processTick
};