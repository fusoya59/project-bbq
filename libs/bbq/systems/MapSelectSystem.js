ns('bbq.systems');

bbq.systems.MapSelectSystem = function (em, camera) {
    var _cursor = new boc.core.Entity({ description: 'mapCursor' });
    _cursor.currentSelection = null;
    _cursor.previousSelection = null;
    _cursor.hide = false;
    _cursor.locked = false;
    _cursor.addComponent(
        new boc.components.Spatial({
            x: 0,
            y: 0,
            z: bbq.zindex.CURSOR,
            width: 50,
            height: 50
        })
    );
    _cursor.addComponent(
        new boc.components.DrawableSprite({
            image: boc.resources.GraphicsManager.getImage('assets/Misc/select_cursor.png'),
            alpha: 1.0,
            visible: false
        })
    );
    _cursor.addComponent(
        new bbq.components.MapElement({
            x: 0,
            y: 0
        })
    );
    _cursor.addComponent(new boc.components.Identifiable({}));
    _cursor.addComponent(new bbq.components.Cursor());
    _cursor.oldZ = null;

    // just cause i can!!    
    //_cursor.addComponent(
    //    new boc.pfx.components.Emitter({
    //        particleFactory: new boc.pfx.particleFactories.SmokeStarFactory(em, 20),
    //        startVector: {x : 0, y:-1 },
    //        startVelocity: 125, // pixels per sec
    //        accelerationVector : { x:0, y:0.025 },
    //        emitRadius : 30,
    //        particleDuration : 2500, // ms
    //        particlesPerSecond : 15
    //    })
    //);        

    var _cursorAlphas = [1.0, 1.0, 1.0, 1.0, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5, 0.45, 0.4];

    var _cursorSprites = [];
    for (var i = 0; i < _cursorAlphas.length; i++) {
        _cursorSprites.push(
            new boc.components.DrawableSprite({
                image: boc.resources.GraphicsManager.getImage('assets/Misc/select_cursor.png'),
                alpha: _cursorAlphas[i]
            })
        );
    } // i
    for (var i = _cursorAlphas.length - 1; i >= 0; i--) {
        _cursorSprites.push(
            new boc.components.DrawableSprite({
                image: boc.resources.GraphicsManager.getImage('assets/Misc/select_cursor.png'),
                alpha: _cursorAlphas[i]
            })
        );
    } // i

    var _cursorAnim = new boc.utils.SpriteAnimationSequence({
        entityManager: em,
        entity: _cursor,
        loop: true,
        animations: [
            new boc.components.SpriteAnimation({
                sprites: _cursorSprites,
                duration: 1500,
                easing: 'linear'
            })
        ]
    });
    _cursorAnim.start();

    this.processTick = function (frameTime) {
        var mapSelectEventEnts = em.getAllEntitiesWithComponent('MapSelectEvent');

        for (var i = 0; i < mapSelectEventEnts.length; i++) {
            var mapSelectEvent = em.getComponentForEntity('MapSelectEvent', mapSelectEventEnts[i]);
            if (mapSelectEvent.action == 'hideCursor') {
                _cursor.hide = true;
                _cursor.DrawableSprite.visible = false;
            }
            else if (mapSelectEvent.action == 'showCursor') {
                _cursor.hide = false;
                _cursor.DrawableSprite.visible = true;
            }
            else if (mapSelectEvent.action == 'lockCursor') {
                _cursor.locked = true;
            }
            else if (mapSelectEvent.action == 'unlockCursor') {
                _cursor.locked = false;
            }
            else if (mapSelectEvent.action === 'selectAndHide') {
            	_cursor.DrawableSprite.visible = false;
            	_cursor.currentSelection = mapSelectEvent.args ? mapSelectEvent.args.selected : null;
            }
            else if (mapSelectEvent.action == 'moveCursor' && mapSelectEvent.args.entity) {
                var entSpatial = em.getComponentForEntity('Spatial', mapSelectEvent.args.entity);
                var entMapElement = em.getComponentForEntity('MapElement', mapSelectEvent.args.entity);
                _cursor.Spatial.update({
                    x: entSpatial.x + entSpatial.width - _cursor.Spatial.width,
                    y: entSpatial.y + entSpatial.height - _cursor.Spatial.height
                });
                _cursor.MapElement.x = entMapElement.x;
                _cursor.MapElement.y = entMapElement.y;
            }
            boc.utils.consumeEvent(mapSelectEventEnts[i], 'MapSelectEvent', em);
        } // i

        if (_cursor.locked) { return; }

        var identifyEvents = em.getAllEntitiesWithComponent('IdentifyEvent');

        for (var i = 0; i < identifyEvents.length; i++) {
            var idEventEnt = identifyEvents[i];
            var idEvent = em.getComponentForEntity('IdentifyEvent', idEventEnt);
            var sortedEnts = idEvent.identifiedEntities.slice()
                .sort(function (a, b) {
                    var spatialA = em.getComponentForEntity('Spatial', a);
                    var spatialB = em.getComponentForEntity('Spatial', b);

                    if (!spatialA && !spatialB) { return 0; }
                    if (spatialA && !spatialB) { return 1; }
                    if (!spatialA && spatialB) { return -1; }
                    return spatialA.z - spatialB.z;
                });

            var topEnt = sortedEnts.pop();
            var topMapElement = em.getComponentForEntity('MapElement', topEnt);
            var topDrawable = em.getComponentForEntity('DrawableSprite', topEnt) || em.getComponentForEntity('SpineDrawable', topEnt);
            var topIdentifiable = em.getComponentForEntity('Identifiable', topEnt);
            var goodToId = topDrawable && topDrawable.visible || (!topDrawable && topIdentifiable && topIdentifiable.hot);

            //while (topEnt && (!topMapElement || !topDrawable.visible)) {
            while (topEnt && (!topMapElement || !goodToId)) {
                topEnt = sortedEnts.pop();
                if (topEnt) {
                    topMapElement = em.getComponentForEntity('MapElement', topEnt);                    
                    topDrawable = em.getComponentForEntity('DrawableSprite', topEnt) || em.getComponentForEntity('Spinedrawable', topEnt);
                    topIdentifiable = em.getComponentForEntity('Identifiable', topEnt);
                    goodToId = topDrawable && topDrawable.visible || topIdentifiable && topIdentifiable.hot;
                }
            }

            if (topEnt) {
                _cursor.previousSelection = _cursor.currentSelection;
                //if (_cursor.previousSelection != null) {
                //    $em(_cursor.previousSelection).comp('Spatial').update({ z: _cursor.oldZ });
                //}

                if (topEnt == _cursor.id()) {
                    _cursor.DrawableSprite.visible = false;
                    _cursor.currentSelection = null;
                }
                else {
                    var topEntSpatial = em.getComponentForEntity('Spatial', topEnt);
                    _cursor.Spatial.update({
                        x: topEntSpatial.x + topEntSpatial.width - _cursor.Spatial.width,
                        y: topEntSpatial.y + topEntSpatial.height - _cursor.Spatial.height
                    });
                    _cursor.MapElement.x = topMapElement.x;
                    _cursor.MapElement.y = topMapElement.y;
                    if (!_cursor.hide) {
                        _cursor.DrawableSprite.visible = true;
                    }
                    _cursor.currentSelection = topEnt;
                }
                //console.log(topEnt);                
                boc.utils.createEvent(
                    new bbq.events.MapSelectEvent({
                        action: 'select',
                        args: {
                            selected: _cursor.currentSelection,
                            previous: _cursor.previousSelection
                        }
                    }),
                    em
                );
                //if (_cursor.currentSelection != null) {
                //    _cursor.oldZ = $em(_cursor.currentSelection).comp('Spatial').z;
                //    if ($em(_cursor.currentSelection).has('Unit') || $em(_cursor.currentSelection).has('Building')) {
                //        $em(_cursor.currentSelection).comp('Spatial').update({ z: _cursor.Spatial.z - 1 });
                //    }
                //}
            }
            boc.utils.consumeEvent(idEventEnt, 'IdentifyEvent', em);
        } //i        
        // center camera
        /*
        $em('MouseEvent').each(function (e, c) {
            if (c.action === 'doubleclick') {
                var player = boc.utils.getCurrentPlayer();
                var unit = null;
                for (var u = 0; u < player.units.length; u++) {
                    unit = player.units[u];
                    if ($em(unit).comp('Unit').state === 'idle') {
                        // center the camera on this unit
                        var cx = (camera.xmin + camera.xmax) / 2;
                        var cy = (camera.ymin + camera.ymax) / 2;
                        var uspatial = $em(unit).comp('Spatial');
                        var ux = uspatial.x + uspatial.width / 2;
                        var uy = uspatial.y + uspatial.height / 2;
                        camera.move(ux - cx, uy - cy);
                        //console.log(unit);
                        break;
                    }
                } //u
                if (unit) {
                    boc.utils.createEvent(new boc.components.IdentifyEvent({ identifiedEntities: [unit] }), em);
                }
                boc.utils.consumeEvent(e, c.className(), em);
            }
        });
        */
    }; // processTick
}; // MapSelectSystem