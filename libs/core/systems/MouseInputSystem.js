ns('boc.systems');

// captures all javascript mouse events and injects it to the system
boc.systems.MouseInputSystem = function (entityManager, canvas) {
    var em = entityManager;

    var _isMouseDown = false;
    var _doubleClickThreshold = 180; //ms

    canvas.onmousedown = function (e) {
        _isMouseDown = true;
        var ent = em.createEntity();
        em.addComponentToEntity(
            new boc.components.MouseEvent({
                action: 'mousedown',
                element: canvas,
                stateObj: e
            }),
            ent
        );
        em.addComponentToEntity(
            new boc.components.Lifespan({
                duration: 1000
            }),
            ent
        );
    }; // mousedown

    canvas.onmouseup = function (e) {
        _isMouseDown = false;
        var ent = em.createEntity();
        em.addComponentToEntity(
            new boc.components.MouseEvent({
                action: 'mouseup',
                element: canvas,
                stateObj: e
            }),
            ent
        );
        em.addComponentToEntity(
            new boc.components.Lifespan({
                duration: 1000
            }),
            ent
        );
    }; // mouseup

    canvas.onmousemove = function (e) {
        if (_isMouseDown) {
            var ent = em.createEntity();
            em.addComponentToEntity(
                new boc.components.MouseEvent({
                    action: 'mousedrag',
                    element: canvas,
                    stateObj: e
                }),
                ent
            );
            em.addComponentToEntity(
                new boc.components.Lifespan({
                    duration: 1000
                }),
                ent
            );
        } else {

        }
    }; // mousemove

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