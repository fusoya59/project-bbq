ns('bbq.systems');

bbq.systems.HealSystem = function (map) {
    var em = $em();

    var state = 'wait'; // healMode, healing, healComplete, cleanup, wait
    var healer = null,
        target = null;

    var reset = function () {
        healer = null;
        target = null;
        state = 'wait';
    };//reset

    var showHealOverlay = function (entity) {
        var tiles = bbq.utils.getTilesWithinAttackRange({
            entityManager: em,
            entity: entity,
            costMap: map.costMap(),
            costNodes: map.attackMap(),
            sizeX: map.numColumns(),
            sizeY: map.numRows(),
            rangeOffset: 0
        });

        for (var j = 0; j < tiles.length; j++) {
            var tile = tiles[j].split(',');
            var healTile = new boc.core.Entity({ entityManager: em });
            healTile.addComponent(
                new boc.components.Spatial({
                    x: 0,
                    y: 0,
                    z: bbq.zindex.OVERLAY,
                    width: map.tileWidth(),
                    height: map.tileHeight()
                })
            );
            healTile.addComponent(
                new boc.components.DrawableRect({
                    fillStyle: 'rgba(0,255,0,0.25)',
                    lineWidth: 0
                })
            );
            healTile.addComponent(new bbq.components.HealOverlay());
            healTile.addComponent(new boc.components.Identifiable());
            map.place(healTile.id(), +tile[0], +tile[1]);

            $em('Player').each(function (pe, pc) {
                if (pc.id != boc.utils.getCurrentPlayer(em).id) { return; }
                var unitOnTile = map.getEntities(+tile[0], +tile[1], 'Unit')[0];
                if (unitOnTile && pc.hasEntity(unitOnTile) && $em(unitOnTile).comp('DrawableSprite').visible) {
                    healTile.HealOverlay.target = unitOnTile;

                    var blinkingRect = $em.create();
                    $em(blinkingRect)
                        .add(new boc.components.Spatial({ x: 0, y: 0, z: bbq.zindex.OVERLAY + 1, width: map.tileWidth(), height: map.tileHeight() }))
                        .add(new boc.components.DrawableRect({ fillStyle: 'rgba(0,255,0,0.35)', lineWidth: 0, visible: true }))
                        .add(new bbq.components.HealOverlay());
                    boc.utils.createBlinkingAnimation(blinkingRect, { easing: 'easeInCubic', drawableName: 'DrawableRect', delta: 1.0 }).start();
                    map.place(blinkingRect, +tile[0], +tile[1]);
                }
            });
        } // j
    }; //showHealOverlay

    var clearHealOverlay = function () {
        var healOverlays = $em('HealOverlay').all().slice();
        for (var i = 0; i < healOverlays.length; i++) {
            em.killEntity(healOverlays[i]);
        }
    };//clearHealOverlay

    var healHit = function (src, dst, healPoints, delay) {
        $em($em.create())
            .add(
                new boc.components.DelayedMethod(function () {
                    var targetSpatial = $em(dst).comp('Spatial');
                    boc.utils.createHitEffect(targetSpatial.x, targetSpatial.y, em);
                    boc.utils.createBouncingText(healPoints, targetSpatial.x + targetSpatial.width / 2 - 2, targetSpatial.y + targetSpatial.height - 6, { fillStyle: 'lime', z: bbq.zindex.EFFECTS + 1 });

                    var dstHealth = $em(dst).comp('Health');
                    dstHealth.current += healPoints;
                    dstHealth.current = Math.min(dstHealth.current, dstHealth.max);

                    var dstPlayer = null, srcPlayer = null;
                    $em('Player').each(function (e, c) {
                        if (c.hasEntity(src)) {
                            srcPlayer = c;
                        }
                        if (c.hasEntity(dst)) {
                            dstPlayer = c;
                        }
                    });

                    // show the health bar if there was damage done
                    var healthbarComp = $em(dst).comp('HealthBar');
                    var healthbarEnt = healthbarComp.icon; // bg bar, which is                        
                    if (dstHealth.current < dstHealth.max) {
                        $em(healthbarEnt).comp('DrawableRect').visible = true;
                        $em(healthbarComp.currentIcon).comp('DrawableRect').visible = true;
                    }

                    // attack animation completed before i hit
                    if (state == 'healComplete') {
                        state = 'cleanup';
                    } else if (state == 'healing') {
                        state = 'healHit';
                    }
                },
                delay)
            );
    };//healHit

    var healRoutine = function (src, dst, healPoints, onHealEnd) {
        if ($em(src).comp('SpriteAnimation')) {
            $em(src).comp('SpriteAnimation').state = boc.constants.ANIMATION_STOPPED;
        }
        var spineAnimation = em.getComponentForEntity('SpineAnimation', src);
        if (spineAnimation) {
            spineAnimation.state = boc.constants.ANIMATION_PLAYING;
            try {
                spineAnimation.animationState.setAnimationByName('heal', false);
            } catch (err) {
                console.log(err);
                state = 'wait';
                return;
            }
            spineAnimation._previousDrawable = spineAnimation._previousDrawable || em.getComponentForEntity('DrawableSprite', src);

            // store the previous drawable in the animation
            em.removeComponentFromEntity(spineAnimation._previousDrawable.className(), src);

            // arm heal end only once
            if (!spineAnimation._onHealEnd) {
                spineAnimation._onHealEnd = function () {
                    if (state == 'healHit') {
                        state = 'cleanup';
                    } else if (state == 'healing') {
                        state = 'healComplete';
                    }
                    if (onHealEnd) {
                        onHealEnd();
                    }
                };
                spineAnimation.on('onComplete', function (animName) {
                    if (animName == 'heal') {
                        spineAnimation._onHealEnd();
                        var skeleton = $em(spineAnimation.target).comp('SpineDrawable').skeleton;
                        skeleton.setToSetupPose();
                        skeleton.getRootBone().x = 50;
                        skeleton.getRootBone().y = -50;
                        skeleton.updateWorldTransform();
                        if (spineAnimation._previousDrawable) {
                            $em(spineAnimation.target).add(spineAnimation._previousDrawable);
                            spineAnimation._previousDrawable = null;
                        }
                    }
                });
            } // if _onHealEnd
        } // spineAnimation

        healHit(src, dst, healPoints, 500, onHealEnd);
    };//healRoutine 

    var handleHeal = function (idEnts) {
        var healTile = null;
        for (var i = 0; i < idEnts.length; i++) {
            healTile = $em(idEnts[i]).comp('HealOverlay');
            if (healTile) { break; }
        }

        if (healTile && healTile.target) {
            clearHealOverlay();
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'hideCursor' }));
            target = healTile.target;
            var healPoints = $em(healer).comp('Heal').points; // TODO: bonuses
            healRoutine(healer, target, healPoints);
            state = 'healing';
            return true;
        } // click target

        return false;
    };//handleHeal

    this.processTick = function (frameTime) {
        $em('HealEvent').each(function (e, c) {
            if (!c.srcEntity) {
                state = 'healMode';
                healer = c.entity;
                showHealOverlay(healer);
            } else {
                healRoutine(c.entity, c.dstEntity, c.healPoints, c.onComplete);
            }
            boc.utils.consumeEvent(e, c.className(), em);
        });

        if (state == 'healMode') {

            $em('IdentifyEvent').each(function (e, c) {
                // find the cursor
                var cursorEnt = null;
                for (var j = 0; j < c.identifiedEntities.length; j++) {
                    if ($em(c.identifiedEntities[j]).comp('Cursor')) {
                        cursorEnt = c.identifiedEntities[j];
                        break;
                    }
                } //j

                if (cursorEnt) { // i've clicked the cursor, return to previous state                    
                    if ($em(healer).comp('Unit').state == 'idle') {
                        boc.utils.createEvent(
                            new bbq.events.MapSelectEvent({ action: 'unlockCursor' }),
                            em
                        );
                    }
                    boc.utils.createEvent(
                        new bbq.events.CommandEvent({ action: 'showCommands', args: { entity: healer } }),
                        em
                    );
                    clearHealOverlay();
                    reset();
                }
                else {
                    //actually heal
                    if (handleHeal(c.identifiedEntities)) {
                        var currPlayer = boc.utils.getCurrentPlayer();
                        var a = $em(healer).comp('MapElement'), // healer
                            o = $em(target).comp('MapElement');
                        currPlayer.moves.push('(' + a.x + ',' + a.y + ')hl(' + o.x + ',' + o.y + ')');
                    }
                }
                boc.utils.consumeEvent(e, c.className(), em);
            });
        }
        else if (state == 'cleanup') {
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'showCursor' }), em);
            boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: healer } }), em);
            reset();
        }
    };//process
};