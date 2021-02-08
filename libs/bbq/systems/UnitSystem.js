ns('bbq.systems');

// animates units, issues commands, and so on
bbq.systems.UnitSystem = function (em) {
    this.processTick = function (timeFrame) {
        var unitEventEnts = em.getAllEntitiesWithComponent('UnitEvent');
        for (var i = 0; i < unitEventEnts.length; i++) {
            var unitEvent = em.getComponentForEntity('UnitEvent', unitEventEnts[i]);

            if (unitEvent.action == 'inactivate' && $em(unitEvent.args.entity).exists()) {
                var unit = em.getComponentForEntity('Unit', unitEvent.args.entity);
                var team = boc.utils.getCurrentPlayer(em).team;
                unit.state = 'inactive';
                var uspatial = em.getComponentForEntity('Spatial', unitEvent.args.entity);

                // if there's no drawable, add it to the entity
                var udrawable = em.getComponentForEntity('DrawableSprite', unitEvent.args.entity);
                if (!udrawable) {
                    udrawable = new boc.components.DrawableSprite({ image: inactiveImg });
                    em.addComponentToEntity(udrawable, unitEvent.args.entity);
                }
                var inactiveImg = boc.utils.createFilteredImage(unit.type + '_' + team.toLowerCase(), uspatial.width, uspatial.height, 0.5);
                udrawable.image = inactiveImg;
                var uanimation = em.getComponentForEntity('SpriteAnimation', unitEvent.args.entity);
                if (uanimation) { uanimation.state = boc.constants.ANIMATION_STOPPED; }
                boc.utils.consumeEvent(unitEventEnts[i], 'UnitEvent', em);
            }
        } //i 

        var mapSelectEventEnts = em.getAllEntitiesWithComponent('MapSelectEvent');
        for (var i = 0; i < mapSelectEventEnts.length; i++) {
            var mapSelectEvent = em.getComponentForEntity('MapSelectEvent', mapSelectEventEnts[i]);
            if (mapSelectEvent.action == 'select') {
                if (mapSelectEvent.args.selected) {                    
                    var selectAudio = bbq.sh().getAudio(mapSelectEvent.args.selected, 'unitSelect');
                    if (selectAudio) {
                        bbq.sh().play(selectAudio);
                    }
                }
                // return the previously selected entity into its default image state (unit or building only)
                if (mapSelectEvent.args.previous && (em.getComponentForEntity('Building', mapSelectEvent.args.previous) || em.getComponentForEntity('Unit', mapSelectEvent.args.previous))) {

                    // do this only if it's a building or if the unit is not inactive
                    if (!em.getComponentForEntity('Unit', mapSelectEvent.args.previous) || em.getComponentForEntity('Unit', mapSelectEvent.args.previous).state != 'inactive') {
                        var prevAnimComp = em.getComponentForEntity('SpriteAnimation', mapSelectEvent.args.previous) || em.getComponentForEntity('SpineAnimation', mapSelectEvent.args.previous);
                        if (prevAnimComp) {
                            prevAnimComp.state = boc.constants.ANIMATION_STOPPED;
                            if (prevAnimComp.className() == 'SpineAnimation') {
                                var skeleton = $em(prevAnimComp.target).comp('SpineDrawable').skeleton;
                                skeleton.setToSetupPose();
                                skeleton.getRootBone().x = 50;
                                skeleton.getRootBone().y = -50;
                                $em(prevAnimComp.target).comp('SpineDrawable').skeleton.updateWorldTransform();
                                if (prevAnimComp._previousDrawable) {
                                    $em(prevAnimComp.target).add(prevAnimComp._previousDrawable);
                                    prevAnimComp._previousDrawable = null;
                                }
                            }
                        }
                        var prevAnimSetComp = em.getComponentForEntity('SpriteAnimationSet', mapSelectEvent.args.previous);
                        var prevDrawable = em.getComponentForEntity('DrawableSprite', mapSelectEvent.args.previous);
                        if (prevAnimSetComp && prevAnimSetComp['default'] && prevDrawable) {
                            prevDrawable.image = prevAnimSetComp['default'];
                        }
                    }
                } // previous

                // if the current player has this selected entity, do stuff
                if (mapSelectEvent.args.selected && boc.utils.getCurrentPlayer(em).hasEntity(mapSelectEvent.args.selected)) {

                    // animate idle if not inactive
                    var unit = em.getComponentForEntity('Unit', mapSelectEvent.args.selected);
                    if (unit) {
                        if (unit.state != 'inactive') {
                            // TODO: remove me
                            var selectedAnimationSetComp = em.getComponentForEntity('SpriteAnimationSet', mapSelectEvent.args.selected);
                            if (selectedAnimationSetComp && selectedAnimationSetComp['idle']) {
                                var idleAnim = new boc.utils.SpriteAnimationSequence({
                                    entity: mapSelectEvent.args.selected,
                                    entityManager: em,
                                    loop: true,
                                    animations: [
                                        selectedAnimationSetComp['idle']
                                    ]
                                });
                                idleAnim.start();
                            }

                            var spineAnimation = em.getComponentForEntity('SpineAnimation', mapSelectEvent.args.selected);
                            if (spineAnimation) {
                                spineAnimation.state = boc.constants.ANIMATION_PLAYING;
                                spineAnimation.animationState.setAnimationByName('idle', true);
                                spineAnimation._previousDrawable = spineAnimation._previousDrawable || em.getComponentForEntity('DrawableSprite', mapSelectEvent.args.selected);
                                // store the previous drawable in the animation
                                em.removeComponentFromEntity(spineAnimation._previousDrawable.className(), mapSelectEvent.args.selected);
                            }

			                var commands = em.getComponentForEntity('Commandable', mapSelectEvent.args.selected).commands;
							
							// remove wait from initial commands list
							var hasMoved = false;
							for (var c = 0; c < commands.length; c++) {
								if (commands[c].name() == 'Move') {
									if (commands[c].disabled() == true) {
										hasMoved = true;
										break;
									}
								}
							}
							
							for (var c = 0; c < commands.length; c++) {
								if (commands[c].name() == 'Hold') {
									if (hasMoved) {
										commands[c].disabled(false);
									} else {
										commands[c].disabled(true);
									}
									break;
								}
							}
							
                            boc.utils.createEvent(
                                new bbq.events.CommandEvent({
                                    action: 'showCommands',
                                    args: { entity: mapSelectEvent.args.selected }
                                }),
                                em
                            );
                        }
                        else { // inactive unit. hide commands
                            boc.utils.createEvent(
                                new bbq.events.CommandEvent({
                                    action: 'hideCommands',
                                    args: { entity: mapSelectEvent.args.selected }
                                }),
                                em
                            );
                        }
                    }
                    else { // probably a building
                        boc.utils.createEvent(
                            new bbq.events.CommandEvent({
                                action: 'showCommands',
                                args: { entity: mapSelectEvent.args.selected }
                            }),
                            em
                        );

						var selectAudio = bbq.sh().getAudio('effects/buttonClick');
						console.log(selectAudio);
						if (selectAudio) {
							bbq.sh().play(selectAudio);
						}
                    }
                }

                    // selected some entity not belonging to player
                else {
                    boc.utils.createEvent(
                        new bbq.events.CommandEvent({
                            action: 'hideCommands',
                            args: { entity: mapSelectEvent.args.selected }
                        }),
                        em
                    );
                }

                boc.utils.createEvent(new bbq.events.HudEvent({ entity: mapSelectEvent.args.selected }), em);
                //em.getComponentForEntity('UnitStats', em.getAllEntitiesWithComponent('UnitStats')[0])
                //        .target(mapSelectEvent.args.selected);
            } // select
            boc.utils.consumeEvent(mapSelectEventEnts[i], 'MapSelectEvent', em);
        } // i
    } // processTick 
}; //UnitSystem 