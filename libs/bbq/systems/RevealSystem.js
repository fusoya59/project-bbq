ns('bbq.systems');
bbq.systems.RevealSystem = function (map) {
    var em = $em();

    var state = 'wait'; // revealMode, revealing, revealComplete, cleanup, wait
    var revealer = null,
        target = null;

    var reset = function () {
        revealer = null;
        target = null;
        state = 'wait';
    };//reset

    var showRevealOverlay = function (entity) {
        var tiles = bbq.utils.getTilesWithinRevealRange({
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
            var revealTile = new boc.core.Entity({ entityManager: em });
            revealTile.addComponent(
                new boc.components.Spatial({
                    x: 0,
                    y: 0,
                    z: bbq.zindex.OVERLAY,
                    width: map.tileWidth(),
                    height: map.tileHeight()
                })
            );
            revealTile.addComponent(
                new boc.components.DrawableRect({
                    fillStyle: 'rgba(255,255,255,0.25)',
                    lineWidth: 0
                })
            );
            revealTile.addComponent(new bbq.components.RevealOverlay());
            revealTile.addComponent(new boc.components.Identifiable());
            boc.utils.createBlinkingAnimation(revealTile, { easing: 'easeInCubic', drawableName: 'DrawableRect', delta: 1.0 }).start();
            map.place(revealTile.id(), +tile[0], +tile[1]);
        } // j
    }; //showRevealOverlay

    var clearRevealOverlay = function () {
        var revealOverlays = $em('RevealOverlay').all().slice();
        for (var i = 0; i < revealOverlays.length; i++) {
            em.killEntity(revealOverlays[i]);
        }
    };//clearRevealOverlay

    var revealHit = function (src, dst, delay) {
        $em($em.create())
            .add(
                new boc.components.DelayedMethod(function () {

                    boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
                    boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
                    console.log('Fog updated!');
                    // attack animation completed before i hit
                    if (state == 'revealComplete') {
                        state = 'cleanup';
                    } else if (state == 'revealing') {
                        state = 'revealHit';
                    }
                },
                delay)
            );
    };//revealHit

    var revealRoutine = function (src, dst, onComplete) {
        if ($em(src).comp('SpriteAnimation')) {
            $em(src).comp('SpriteAnimation').state = boc.constants.ANIMATION_STOPPED;
        }
        var spineAnimation = em.getComponentForEntity('SpineAnimation', src);
        if (spineAnimation) {
            spineAnimation.state = boc.constants.ANIMATION_PLAYING;
            try {
                spineAnimation.animationState.setAnimationByName('reveal', false);
            } catch (err) {
                console.log(err);
                state = 'wait';
                return;
            }
            spineAnimation._previousDrawable = spineAnimation._previousDrawable || em.getComponentForEntity('DrawableSprite', src);

            // store the previous drawable in the animation
            em.removeComponentFromEntity(spineAnimation._previousDrawable.className(), src);

            // arm reveal end only once
            if (!spineAnimation._onRevealEnd) {
                spineAnimation._onRevealEnd = function () {
                    if (state == 'revealHit') {
                        state = 'cleanup';
                    } else if (state == 'revealing') {
                        state = 'revealComplete';
                    }
                    if (onComplete) {
                        onComplete();
                    }
                };
                spineAnimation.on('onComplete', function (animName) {
                    if (animName == 'reveal') {
                        spineAnimation._onRevealEnd();
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
            } // if _onRevealEnd
        } // spineAnimation
        var targetSpatial = $em(dst).comp('Spatial');
        boc.utils.createHitEffect(targetSpatial.x, targetSpatial.y, em);

        revealHit(src, dst, 300);
    };//revealRoutine 

    var handleReveal = function (idEnts) {
        var revealTile = null, revealTileEntity = null;
        for (var i = 0; i < idEnts.length; i++) {
            revealTileEntity = idEnts[i];
            revealTile = $em(idEnts[i]).comp('RevealOverlay');
            if (revealTile) { break; }
        }

        if (revealTile) {
            var x = $em(revealTileEntity).comp('MapElement').x;
            var y = $em(revealTileEntity).comp('MapElement').y;
            var radius = $em(revealer).comp('Reveal').radius; // TODO: bonuses

            clearRevealOverlay();
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'hideCursor' }));
            var srcPlayer = null;
            $em('Player').each(function (e, c) {
                if (c.hasEntity(revealer)) {
                    srcPlayer = c;
                }
            });

            target = $em.create();
            $em(target)
                    .add(new boc.components.Spatial({
                        x: 0,
                        y: 0,
                        z: bbq.zindex.OVERLAY,
                        width: map.tileWidth(),
                        height: map.tileHeight()
                    }))
                    .add(new bbq.components.RevealSpot(x, y, radius, srcPlayer));

            map.place(target, x, y);

            revealRoutine(revealer, target);
            state = 'revealing';
            return true;
        } // click target

        return false;
    };//handleReveal

    this.processTick = function (frameTime) {
        $em('RevealEvent').each(function (e, c) {
            if (!c.dstEntity) {
                state = 'revealMode';
                revealer = c.entity;
                showRevealOverlay(revealer);
            } else {
                revealRoutine(c.entity, c.dstEntity, c.onComplete);
            }
            boc.utils.consumeEvent(e, c.className(), em);
        });

        if (state == 'revealMode') {

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
                    if ($em(revealer).comp('Unit').state == 'idle') {
                        boc.utils.createEvent(
                            new bbq.events.MapSelectEvent({ action: 'unlockCursor' }),
                            em
                        );
                    }
                    boc.utils.createEvent(
                        new bbq.events.CommandEvent({ action: 'showCommands', args: { entity: revealer } }),
                        em
                    );
                    clearRevealOverlay();
                    reset();
                }
                else {
                    //actually reveal
                    if (handleReveal(c.identifiedEntities)) {
                        var currPlayer = boc.utils.getCurrentPlayer();
                        var a = $em(revealer).comp('MapElement'), // revealer
                            o = $em(target).comp('MapElement');
                        currPlayer.moves.push('(' + a.x + ',' + a.y + ')rv(' + o.x + ',' + o.y + ')');
                    }
                }
                boc.utils.consumeEvent(e, c.className(), em);
            });
        }
        else if (state == 'cleanup') {
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'showCursor' }), em);
            boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: revealer } }), em);
            reset();
        }
    };//process
};