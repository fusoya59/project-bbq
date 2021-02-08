ns('boc.systems');

boc.systems.DelayedMethodSystem = function (em) {
    this.processTick = function (frameTime) {
        var toKill = null;
        $em('DelayedMethod').each(function (e, c) {
            c.elapsed += frameTime;
            if (c.elapsed >= c.delay) {
                if (c.run) { c.run(); }
                if (!toKill) { toKill = []; }
                toKill.push(e);
            }
        });
        if (toKill) {
            while (toKill.length > 0) {
                $em(toKill.pop()).kill();
            }
        }
    }
};