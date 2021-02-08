ns('boc.systems');

// identifies all entities on a mouse click
boc.systems.IdentifySystem = function (entityManager, camera) {
    var em = entityManager;
    var _mouseState = 'idle';
    var _drag_pid = null;
    var _dragThreshold = 140; // ms
    var _camera = camera;

    this.processTick = function (frameTime) {
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
                lifespanComponent.duration = 0;

                if (mouseEventComponent.action == 'mousedown') {
                    _mouseState = 'down';
                }
                else if (mouseEventComponent.action == 'mouseup') {
                    if (_mouseState != 'drag') {
                        var offset = {
                            x: $(document).scrollLeft() + camera.xmin,
                            y: $(document).scrollTop() + camera.ymin
                        };

                        var clickPoint = {
                            x: ((mouseEventComponent.stateObj.clientX - mouseEventComponent.element.offsetLeft) + offset.x) / camera.zoom,
                            y: ((mouseEventComponent.stateObj.clientY - mouseEventComponent.element.offsetTop) + offset.y) / camera.zoom
                        };


                        var identifiableEnts = em.getAllEntitiesWithComponent('Identifiable');
                        var identifiedEnts = [];
                        for (var j = 0; j < identifiableEnts.length; j++) {
                            var spatial = em.getComponentForEntity('Spatial', identifiableEnts[j]);
                            if (spatial && boc.utils.toBounds(spatial).containsPoint(clickPoint)) {
                                identifiedEnts.push(identifiableEnts[j]);
                            }
                        } //j

                        if (identifiedEnts.length > 0) {
                            boc.utils.createEvent(new boc.components.IdentifyEvent({ identifiedEntities: identifiedEnts }), em);
                            console.log(identifiedEnts);
                        }

                        /*
                        var entWithHighestZ = null;
                        for (var j = 0; j < identifiableEnts.length; j++) {
                            var identifiableComponent = em.getComponentForEntity('Identifiable', identifiableEnts[j]);
                            var spatial = em.getComponentForEntity('Spatial', identifiableEnts[j]);
                                                            
                            if ( boc.utils.toBounds(spatial).containsPoint(clickPoint) ) {                                
                                if (entWithHighestZ == null) {
                                    entWithHighestZ = { 
                                        entity:  identifiableEnts[j], 
                                        z : spatial.z, 
                                        idComp : identifiableComponent 
                                    };
                                } // no highestZ
                                else {
                                    if (spatial.z > entWithHighestZ.z) { 
                                        entWithHighestZ = { 
                                            entity : identifiableEnts[j], 
                                            z : spatial.z, 
                                            idComp : identifiableComponent
                                        }; 
                                    }
                                } // highestZ
                            }                            
                            // only gets the top one
                        } // j
                            
                        if (entWithHighestZ) {
                            // give a stack of the entities here???
                            for (var j = 0; j < entWithHighestZ.idComp.listeners.length; j++) {
                                entWithHighestZ.idComp.listeners[j]({ entity: entWithHighestZ.entity });
                            } // j
                        } // identified!
                        */
                    } // handle click  

                    _mouseState = 'idle';
                    if (_drag_pid) {
                        clearTimeout(_drag_pid);
                        _drag_pid = null;
                    }
                }
                else if (mouseEventComponent.action == 'mousedrag') {
                    if (!_drag_pid) {
                        _drag_pid = setTimeout(function () {
                            _mouseState = 'drag';
                        }, _dragThreshold);
                    }
                }
            } //i 
        }
    } // processTick
};