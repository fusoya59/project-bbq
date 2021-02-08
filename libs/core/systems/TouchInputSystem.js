ns('boc.systems');

// captures browser touch events and injects them to the system    
boc.systems.TouchInputSystem = function (entityManager, canvas) {
    var em = entityManager;

    var _isMouseDown = false;
    var _doubleClickThreshold = 180; //ms

    canvas.ontouchstart = function (e) {
        _isMouseDown = true;
        var ent = em.createEntity();
        em.addComponentToEntity(
            new boc.components.MouseEvent({
                action: 'mousedown',
                element: canvas,
                stateObj: e.touches[0]
            }),
            ent
        );
        em.addComponentToEntity(
            new boc.components.Lifespan({
                duration: 1000
            }),
            ent
        );
    }; // ontouchstart

    canvas.ontouchend = function (e) {
        _isMouseDown = false;
        var ent = em.createEntity();
        em.addComponentToEntity(
            new boc.components.MouseEvent({
                action: 'mouseup',
                element: canvas,
                stateObj: e.changedTouches[0]
            }),
            ent
        );
        em.addComponentToEntity(
            new boc.components.Lifespan({
                duration: 1000
            }),
            ent
        );
    }; // ontouchend

    canvas.ontouchmove = function (e) {
        if (_isMouseDown) {
            var ent = em.createEntity();
            em.addComponentToEntity(
                new boc.components.MouseEvent({
                    action: 'mousedrag',
                    element: canvas,
                    stateObj: e.changedTouches[0]
                }),
                ent
            );
            em.addComponentToEntity(
                new boc.components.Lifespan({
                    duration: 1000
                }),
                ent
            );
        }
    }; // ontouchmove    

    var lastClickTime = 0;
    this.processTick = function (frameTime) {
        $em('MouseEvent').each(function (e, c) {
            if (c.action === 'mouseup') {
                if (c.timestamp - lastClickTime < _doubleClickThreshold) {
                    boc.utils.createEvent(new boc.components.MouseEvent({ action: 'doubleclick', element: canvas, stateObj: c.stateObj }), em);
                }
                //console.log(c.timestamp - lastClickTime);
                lastClickTime = c.timestamp;
            }
        });
    } // processTick
};