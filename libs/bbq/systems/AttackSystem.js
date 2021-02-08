ns('bbq.systems');
bbq.systems.AttackSystem = function (em, map) {
    var state = 'wait'; // wait, attackMode, attacking, attackHit, attackComplete, retliateMode, retliating, cleanup
    var attacker = null; // entity
    var opposer = null; // entity

    function reset() {
        state = 'wait';
        attacker = null;
        opposer = null;
    }

    function clearAttackOverlay() {
        var attackOverlays = $em('AttackOverlay').all().slice();
        for (var i = 0; i < attackOverlays.length; i++) {
            em.killEntity(attackOverlays[i]);
        }
    } //clearAttackOverlay

    function showAttackOverlay(entity) {
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
            var attackTile = new boc.core.Entity({ entityManager: em });
            attackTile.addComponent(
                new boc.components.Spatial({
                    x: 0,
                    y: 0,
                    z: bbq.zindex.OVERLAY,
                    width: map.tileWidth(),
                    height: map.tileHeight()
                })
            );
            attackTile.addComponent(
                new boc.components.DrawableRect({
                    fillStyle: 'rgba(255,0,0,0.25)',
                    lineWidth: 0
                })
            );
            attackTile.addComponent(new bbq.components.AttackOverlay());
            attackTile.addComponent(new boc.components.Identifiable());
            map.place(attackTile.id(), +tile[0], +tile[1]);

            $em('Player').each(function (pe, pc) {
                if (pc.id === boc.utils.getCurrentPlayer(em).id) { return; }
                var unitOnTile = map.getEntities(+tile[0], +tile[1], 'Unit')[0];
                if (unitOnTile && pc.hasEntity(unitOnTile) && $em(unitOnTile).comp('DrawableSprite').visible) {
                    attackTile.AttackOverlay.target = unitOnTile;

                    var blinkingRect = $em.create();
                    $em(blinkingRect)
                        .add(new boc.components.Spatial({ x: 0, y: 0, z: bbq.zindex.OVERLAY + 1, width: map.tileWidth(), height: map.tileHeight() }))
                        .add(new boc.components.DrawableRect({ fillStyle: 'rgba(255,0,0,0.35)', lineWidth: 0, visible: true }))
                        .add(new bbq.components.AttackOverlay());
                    boc.utils.createBlinkingAnimation(blinkingRect, { easing: 'easeInCubic', drawableName: 'DrawableRect', delta: 1.0 }).start();
                    map.place(blinkingRect, +tile[0], +tile[1]);
                }
            });
        } // j
    }

    function attackHit(src, dst, dmg, delay, onHit) {
        $em($em.create())
                .add(
                    new boc.components.DelayedMethod(function () {
                        var targetSpatial = $em(dst).comp('Spatial');
                        boc.utils.createHitEffect(targetSpatial.x, targetSpatial.y, em);
                        boc.utils.createBouncingText(dmg, targetSpatial.x + targetSpatial.width / 2 - 2, targetSpatial.y + targetSpatial.height - 6, { fillStyle: 'white', z: bbq.zindex.EFFECTS + 1 });

                        bbq.sh().play(bbq.sh().getAudio(src, 'weaponHit'));
                        bbq.sh().play(bbq.sh().getAudio(dst, 'unitHit'));

                        var dstHealth = $em(dst).comp('Health');
                        dstHealth.current -= dmg;
                        var dstPlayer = null, srcPlayer = null;
                        $em('Player').each(function (e, c) {
                            if (c.hasEntity(src)) {
                                srcPlayer = c;
                            }
                            if (c.hasEntity(dst)) {
                                dstPlayer = c;
                            }
                        });
                        if (dstHealth.current <= 0) {
                            var srcKills = srcPlayer.summary.unitsKilled || 0;
                            var dstLost = dstPlayer.summary.unitsLost || 0;
                            srcPlayer.updateSummary({ unitsKilled: srcKills + 1 });
                            dstPlayer.updateSummary({ unitsLost: dstLost + 1 });
                            $em(src).comp('Unit').kills++;
                            var level = bbq.units.getLevel(src);
                            if (level > $em(src).comp('Unit').level) {
                                bbq.units.levelUp(src, level, false);
                            }
                        }

                        // show the health bar if there was damage done
                        var healthbarComp = $em(dst).comp('HealthBar');
                        var healthbarEnt = healthbarComp.icon; // bg bar, which is                        
                        if (dstHealth.current < dstHealth.max) {
                            $em(healthbarEnt).comp('DrawableRect').visible = true;
                            $em(healthbarComp.currentIcon).comp('DrawableRect').visible = true;
                        }

                        // attack animation completed before i hit
                        if (state == 'attackComplete') {
                            state = 'retaliateMode';
                        } else if (state == 'attacking') {
                            state = 'attackHit';
                        }
                        if (onHit) { onHit(); }
                    },
                    delay)
                 );
    }

    function attackRoutine(src, dst, dmg, onAttackEnd) {
        if ($em(src).comp('SpriteAnimation')) {
            $em(src).comp('SpriteAnimation').state = boc.constants.ANIMATION_STOPPED;
        }
        var animationSet = $em(src).comp('SpriteAnimationSet');
        var attackAnim = null;
        if (animationSet && animationSet['attack']) {
            attackAnim = new boc.utils.SpriteAnimationSequence({
                entity: src,
                entityManager: em,
                loop: false,
                onLoopComplete: onAttackEnd,
                animations: [
                    animationSet['attack']
                ]
            }).start();
        }

        var spineAnimation = em.getComponentForEntity('SpineAnimation', src);
        if (spineAnimation) {
            spineAnimation.state = boc.constants.ANIMATION_PLAYING;
            spineAnimation.animationState.setAnimationByName('attack', false);
            spineAnimation._previousDrawable = spineAnimation._previousDrawable || em.getComponentForEntity('DrawableSprite', src);
            // store the previous drawable in the animation
            em.removeComponentFromEntity(spineAnimation._previousDrawable.className(), src);

            // arm attack end only once
            if (!spineAnimation._onAttackEnd) {
                spineAnimation._onAttackEnd = onAttackEnd;
                spineAnimation.on('onComplete', function (animName) {
                    if (animName == 'attack') {
                        if (spineAnimation._onAttackEnd) {
                            spineAnimation._onAttackEnd();
                        }
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
            }
        }

        var unit = $em(src).comp('Unit');
        bbq.sh().play(bbq.sh().getAudio(src, 'weaponWindup'));        

        //var dmg = $em(src).comp('Attack').damage; // TODO: bonuses

        //if (unit.type === 'SpearWarrior') {
        //    //var hitTime = bbq.units.configuration[unit.type].animationSets.attack.hitTime;
        //    attackHit(src, dst, dmg, hitTime);
        //}
        /*else */if (unit.type === 'Catapult') {
            function onRockHit(p) {
                var animEnt = p.entity;
                $em(animEnt).remove('ParabolicTranslationAnimation');
                $em(rock).kill();
                attackHit(src, dst, dmg, 0);
            }

            var srcSpatial = $em(src).comp('Spatial'),
                dstSpatial = $em(dst).comp('Spatial');
            var dx = dstSpatial.x - srcSpatial.x,
                dy = dstSpatial.y - srcSpatial.y;
            var mag = Math.sqrt(dx * dx + dy * dy);
            var speed = 300;

            var rock = $em.create();
            var anim = new bbq.components.ParabolicTranslationAnimation({
                dx: dx,
                dy: dy,
                easing: 'linearTween',
                duration: mag / speed * 1000,
                state: boc.constants.ANIMATION_STOPPED
            });
            anim.addListener('onComplete', onRockHit);

            $em(rock)
                .add(new boc.components.Spatial({
                    x: srcSpatial.x + srcSpatial.width / 2 - 6, // center of rock
                    y: srcSpatial.y + srcSpatial.height / 2 - 6,
                    z: srcSpatial.z + 1,
                    width: 13,
                    height: 13
                }))
                .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('assets/Projectiles/rock.png'), visible: false }))
                .add(anim);

            $em($em.create())
                .add(new boc.components.DelayedMethod(
                    function () {
                        $em(rock).comp('ParabolicTranslationAnimation').state = boc.constants.ANIMATION_PLAYING;
                        $em(rock).comp('DrawableSprite').visible = true;
                    },
                    1100));
        }
        else if (unit.type === 'DartBlower') {
            function onDartHit(p) {
                var animEnt = p.entity;
                $em(animEnt).remove('Animation');
                $em(dart).kill();
                attackHit(src, dst, dmg, 0);
            }
            var dart = $em.create();

            var srcSpatial = $em(src).comp('Spatial'),
                dstSpatial = $em(dst).comp('Spatial');
            var dx = dstSpatial.x - srcSpatial.x,
                dy = dstSpatial.y - srcSpatial.y;
            var angleRad = -Math.atan2(dx, dy);
            var mag = Math.sqrt(dx * dx + dy * dy);
            var speed = 300; // px per sec

            var anim = new boc.components.Animation({
                componentName: 'Spatial',
                propertyDeltas: { x: dx, y: dy },
                easing: 'linearTween',
                duration: mag / speed * 1000,
                state: boc.constants.ANIMATION_PLAYING
            });
            anim.addListener('onComplete', onDartHit);

            $em(dart)
                .add(new boc.components.Spatial({
                    x: srcSpatial.x + srcSpatial.width / 2 - 6, // center of the src 
                    y: srcSpatial.y + srcSpatial.height / 2 - 12,
                    z: Math.max(srcSpatial.z, dstSpatial.z) + 1,
                    angle: angleRad,
                    width: 12,
                    height: 23
                }))
                .add(new boc.components.DrawableSprite({
                    image: boc.resources.GraphicsManager.getImage('assets/Projectiles/dart.png'),
                    visible: true
                }))
                .add(anim);

        }
        else { // some crappy default attack routine
            attackHit(src, dst, dmg, 500);
        }
    }

    // returns true if attacking
    function handleAttack(idEnts) {
        var attackTile = null;
        for (var i = 0; i < idEnts.length; i++) {
            attackTile = $em(idEnts[i]).comp('AttackOverlay');
            if (attackTile) { break; }
        }

        if (attackTile && attackTile.target) {
            clearAttackOverlay();
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'hideCursor' }));
            //boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }));            
            opposer = attackTile.target;
            var dmg = $em(attacker).comp('Attack').damage; // TODO: bonuses
            attackRoutine(attacker, opposer, dmg, function () {
                // attack hit happened before i finished my attack animation
                // enter retliate                
                if (state == 'attackHit') {
                    state = 'retaliateMode';
                } else if (state == 'attacking') {
                    state = 'attackComplete';
                }
            });
            state = 'attacking';
            return true;
        } // click target
        return false;
    }

    // returns true if retaliating
    function handleRetaliate() {
        var canRetaliate = false;
        $em('Player').each(function (e, c) {
            // can the opposing player see you ?
            // is the attacker in range ?
            if ($em(opposer).exists() && c.hasEntity(opposer) && $em(opposer).comp('Health').current > 0) { // player has this unit...
                var tileKey = boc.utils.toTileKey($em(attacker).comp('MapElement'));
                var opposerTileRange = bbq.utils.getTilesWithinAttackRange({
                    entityManager: em,
                    entity: opposer,
                    costMap: map.costMap(),
                    costNodes: map.attackMap(),
                    sizeX: map.numColumns(),
                    sizeY: map.numRows(),
                    rangeOffset: 0
                });

                if (c.visibleMapTiles.indexOf(tileKey) >= 0 && opposerTileRange.indexOf(tileKey) >= 0) {
                    var dmg = Math.floor($em(opposer).comp('Retaliate').damage);
                    attackRoutine(opposer, attacker, dmg, function () {
                        state = 'cleanup';
                    });
                    canRetaliate = true;
                }
            }
        });
        if (canRetaliate) {
            state = 'retaliating';
        }
        else {
            state = 'cleanup';
        }
        return canRetaliate;
    }


    this.processTick = function (frameTime) {
        $em('CommandEvent').each(function (e, c) {
            if (c.action === 'attackMode') {
                state = 'attackMode';
                attacker = c.args.entity;
                showAttackOverlay(attacker);
            }
            else if (c.action === 'attackEntity') {
                attackRoutine(c.args.src, c.args.dst, c.args.damage, c.args.onAttackEnd);
            }
            //event should already be consumed
            boc.utils.consumeEvent(e, c.className(), $em());
        }); //each

        if (state === 'attackMode') {
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
                    if ($em(attacker).comp('Unit').state == 'idle') {
                        boc.utils.createEvent(
                            new bbq.events.MapSelectEvent({ action: 'unlockCursor' }),
                            em
                        );
                    }
                    boc.utils.createEvent(
                        new bbq.events.CommandEvent({ action: 'showCommands', args: { entity: attacker } }),
                        em
                    );
                    clearAttackOverlay();
                    reset();
                }
                else {
                    //actually attack
                    if (handleAttack(c.identifiedEntities)) {
                        var currPlayer = boc.utils.getCurrentPlayer();
                        var a = $em(attacker).comp('MapElement'), // attacker
                            o = $em(opposer).comp('MapElement');
                        currPlayer.moves.push('(' + a.x + ',' + a.y + ')a(' + o.x + ',' + o.y + ')');
                    }
                }
                boc.utils.consumeEvent(e, c.className(), em);
            });
        } // attackMode
        else if (state === 'retaliateMode') {
            if (handleRetaliate()) {
                var currPlayer = boc.utils.getCurrentPlayer();
                var a = $em(attacker).comp('MapElement'), // attacker
                    o = $em(opposer).comp('MapElement'); // opposer
                currPlayer.moves.push('(' + o.x + ',' + o.y + ')r(' + a.x + ',' + a.y + ')');
            }
        }
        else if (state === 'cleanup') {
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'showCursor' }), em);
            boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: attacker } }), em);
            //$em(attacker).comp('Unit').state = 'inactive';
            var cmds = $em(attacker).comp('Commandable');
            if (cmds) {
                cmds = cmds.commands;
                for (var c = 0; c < cmds.length; c++) {
                    if (cmds[c].name() === 'Attack' && cmds[c].onAttackEnd) {
                        cmds[c].onAttackEnd();
                    }
                }
            }
            
            reset();
            state = 'wait';
        }
    }; // processTick
};//AttackSystem