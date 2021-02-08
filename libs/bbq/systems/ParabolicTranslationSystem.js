ns('bbq.systems');

bbq.systems.ParabolicTranslationSystem = function (em) {
    this.processTick = function (frameTime) {
        //frameTime = this.speed ? frameTime * this.speed : frameTime;
        var pEnts = em.getAllEntitiesWithComponent('ParabolicTranslationAnimation');
        for (var i = 0; i < pEnts.length; i++) {
            var pEnt = pEnts[i];
            var spatial = em.getComponentForEntity('Spatial', pEnt);
            var parabola = em.getComponentForEntity('ParabolicTranslationAnimation', pEnt);
            if (parabola.state != boc.constants.ANIMATION_PLAYING) { continue; }
            if (parabola.elapsedTime == 0) {
                if (parabola.dx == 0) { parabola.dx++; }
                var xstart = spatial.x;
                var xend = spatial.x + parabola.dx;
                var ystart = spatial.y;
                var yend = spatial.y + parabola.dy;
                parabola.xstart = xstart;
                parabola.xend = xend;
                parabola.ystart = ystart;
                parabola.yend = yend;
                var xmid = (xstart + xend) / 2;
                var ymid = (ystart + yend) / 2 - parabola.height;
                var denom = (xstart - xmid) * (xstart - xend) * (xmid - xend);
                parabola.A = (xend * (ymid - ystart) + xmid * (ystart - yend) + xstart * (yend - ymid)) / denom;
                parabola.B = (xend * xend * (ystart - ymid) + xmid * xmid * (yend - ystart) + xstart * xstart * (ymid - yend)) / denom;
                parabola.C = (xmid * xend * (xmid - xend) * ystart + xend * xstart * (xend - xstart) * ymid + xstart * xmid * (xstart - xmid) * yend) / denom;
                parabola.m = (yend - ystart) / (xend - xstart);
            } // setup

            parabola.elapsedTime += frameTime;

            if (parabola.elapsedTime >= parabola.duration) {
                spatial.update({
                    x: parabola.xend,
                    y: parabola.yend
                });
                parabola.state = boc.constants.ANIMATION_COMPLETE;
                parabola.notify('onComplete', { entity: pEnt });
                console.log('complete' + parabola.duration);
            }
            else {
                var easingFn = Math[parabola.easing] || 'linearTween';
                var newLeft = easingFn(parabola.elapsedTime, parabola.xstart, parabola.dx, parabola.duration);
                var newTop = parabola.A * newLeft * newLeft + parabola.B * newLeft + parabola.C;
                spatial.update({
                    x: newLeft,
                    y: newTop
                });
                //parabola.state = boc.constants.ANIMATION_PLAYING;
            }
        } // i        
    }; // processTick
}; // ParabolicTranslationSystem