ns('bbq.systems');

bbq.systems.HealthSystem = function (em) {
    this.processTick = function (frameTime) {
        var kill = null;
        $em('Health').each(function (e, c) {
            if (c.current <= 0) {
                // poof
                var audio = bbq.sh().getAudio(e, 'unitDeath');
                if (audio) {
                    bbq.sh().play(audio);
                }
                if (!kill) { kill = []; }
                kill.push(e);
                var kSpatial = $em(e).comp('Spatial');
                boc.utils.createSmokeEffect(kSpatial.x, kSpatial.y, em);
                var player = null;
                $em('Player').each(function (pe, pc) {
                    if (pc.hasEntity(e)) {
                        player = pc;
                    }
                });
                if (player) {
                    player.removeUnit(e);
                }
                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
            }
        });
        while (kill && kill.length > 0) {
            $em(kill.pop()).kill();
        }

        $em('HealthBar').each(function (e, c) {
            var h_drawableComp = $em(e).comp('DrawableSprite');
            if (h_drawableComp) {
                var healthbarEnt = c.icon; // bg bar, which is 
                //if (!c.currentIcon) { // actual health
                //    var healthbarSpatial = $em(healthbarEnt).comp('Spatial');
                //    c.currentIcon = $em.create();
                //    $em(c.currentIcon)
                //        .add(new boc.components.Spatial({ x: healthbarSpatial.x + 2, y: healthbarSpatial.y + 2, z: healthbarSpatial.z + 2, width: 0, height: 5 }))
                //        .add(new boc.components.DrawableRect({ fillStyle: 'lime', lineWidth: 0 }));
                //    boc.utils.follow(healthbarEnt, c.currentIcon, em);
                //    $em(healthbarEnt).listen('onKill', function () {
                //        $em(c.currentIcon).kill();
                //    });
                //}
                var healthComp = $em(e).comp('Health');
                var barWidth = 42; //px
                var healthPct = healthComp.current / healthComp.max;
                $em(c.currentIcon).comp('Spatial').update({ width: Math.floor(barWidth * healthPct) });
                if (healthPct >= 0.65) {
                    $em(c.currentIcon).comp('DrawableRect').fillStyle = 'lime';
                }
                else if (healthPct >= 0.40) {
                    $em(c.currentIcon).comp('DrawableRect').fillStyle = 'gold';
                }
                else {
                    $em(c.currentIcon).comp('DrawableRect').fillStyle = 'firebrick';
                }

                if (healthComp.current >= healthComp.max) {
                    $em(healthbarEnt).comp('DrawableRect').visible = false;
                    $em(c.currentIcon).comp('DrawableRect').visible = false;
                }
                //else {
                //    $em(healthbarEnt).comp('DrawableRect').visible = true;
                //    $em(c.currentIcon).comp('DrawableRect').visible = true;
                //}
            }
        });
    }
};