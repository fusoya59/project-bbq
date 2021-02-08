ns('bbq.systems');
bbq.systems.CommandSystem = function (em, canvas, map) {
    var context = canvas.getContext('2d');

    function endTurn(callback, tutCallback) {
        var currPlayer = boc.utils.getCurrentPlayer(em);
        currPlayer.updateTurn(currPlayer.turn + 1);
        currPlayer.upkeep = false;
        currPlayer.moves.push('e'); // end turn\
        //boc.utils.createEvent(new bbq.events.SaveEvent('saveAll', currPlayer.id), em);

        var allPlayers = em.getAllComponents('Player');

        // find the next player
        var nextTeamIndex = (bbq.teams.indexOf(currPlayer.team) + 1) % bbq.teams.length;
        var nextPlayer = null;
        while (!nextPlayer) {
            for (var j = 0; j < allPlayers.length; j++) {
                if (allPlayers[j].id == currPlayer.id) { continue; }
                if (allPlayers[j].team == bbq.teams[nextTeamIndex]) {
                    nextPlayer = allPlayers[j];
                }
            }
            nextTeamIndex = (nextTeamIndex + 1) % bbq.teams.length;
        }
        var turnEnt = em.getAllEntitiesWithComponent('Turn')[0];
        em.getComponentForEntity('Turn', turnEnt).playerid = nextPlayer.id;
        em.getComponentForEntity('Turn', turnEnt).number = nextPlayer.turn;

        //em.getComponentForEntity('Turn', turnEnt).update(nextPlayer.id, nextPlayer.turn);

        //// update the fog
        //boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
        //boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);

        // recolor the enemy units and activate my own
        for (var i = 0; i < allPlayers.length; i++) {
            for (var j = 0; j < allPlayers[i].units.length; j++) {
                var unit = em.getComponentForEntity('Unit', allPlayers[i].units[j]);
                em.getComponentForEntity('DrawableSprite', allPlayers[i].units[j]).image =
                    boc.resources.GraphicsManager.getImage(unit.type + '_' + allPlayers[i].team.toLowerCase());
                    //boc.resources.GraphicsManager.getImage(bbq.units.configuration[unit.type].defaultImagePath.replace('$(team)', allPlayers[i].team));
                if (allPlayers[i].id == nextPlayer.id) {
                    unit.state = 'idle';
                    // enable all commands again
                    var commands = em.getComponentForEntity('Commandable', allPlayers[i].units[j]).commands;
                    for (var k = 0; k < commands.length; k++) {
                        if (commands[k].disabled) { commands[k].disabled(false); }
                    } //k
                }
            } // j            
        } // i    

        if (tutCallback) {
            tutCallback();
        }

        boc.utils.createEvent(
            new bbq.events.SaveEvent(
                'saveAll',
                currPlayer.id,
                function () {
                    if (callback) {
                        callback();
                    }
                }),
                em
            );
    } // endTurn

    function createRingView(p) {
        
        var parentSpatial = p.spatial || em.getComponentForEntity('Spatial', p.entity);
        var commandable = em.getComponentForEntity('Commandable', p.entity);
        if (!commandable || !commandable.commands) { return; }
        var commands = commandable.commands.slice();
		for (var i = commands.length - 1; i >= 0; i--) {
			if (commands[i].disabled && commands[i].disabled({ entityManager: em, map: map, entity: p.entity })) {
				commands.splice(i, 1);
            }
        }

		console.log(commands);
        // check stuff

        var ent = new boc.core.Entity({ entityManager: em });
        ent.addComponent(new boc.components.Spatial({
            x: parentSpatial.x + parentSpatial.width / 2,
            y: parentSpatial.y + parentSpatial.height / 2,
            z: bbq.zindex.UI,
            width: 1,
            height: 1
        }));
        ent.addComponent(new bbq.components.CommandRing());

        var positionmap = bbq.ui.configuration.ringPositions[commands.length - 1];

        var btnEnts = [];

        // for each button, calculate its position according to positionmap
        for (var i = 0; i < commands.length; i++) {
            var btnEnt = bbq.ui.createButton({ 
                entityManager: em, 
                context : context, 
                x: ent.Spatial.x, 
                y: ent.Spatial.y,
                text: commands[i].name(), 
                textFillStyle: 'white'
            });

            var btnSpatial = em.getComponentForEntity('Spatial', btnEnt);
            btnSpatial.update({ x: btnSpatial.x - btnSpatial.width / 2, y: btnSpatial.y - btnSpatial.height / 2 } );
            var dx = ent.Spatial.x + positionmap[i].offsetX - positionmap[i].anchorX * btnSpatial.width - btnSpatial.x;
            var dy = ent.Spatial.y + positionmap[i].offsetY - positionmap[i].anchorY * btnSpatial.height - btnSpatial.y;
            em.addComponentToEntity(
                new boc.components.Animation({                    
                    duration: 150,
                    easing: 'easeOutCubic',
                    componentName: 'Spatial',
                    propertyDeltas: { x: dx, y: dy },
                    state : boc.constants.ANIMATION_PLAYING 
                }),
                btnEnt
            );

            
            //var newX = ent.Spatial.x + positionmap[i].offsetX - positionmap[i].anchorX * btnSpatial.width;
            //var newY = ent.Spatial.y + positionmap[i].offsetY - positionmap[i].anchorY * btnSpatial.height;

            //btnSpatial.update({ x: newX, y: newY });
            btnEnts.push(btnEnt);

            // arm the button
            (function (btn, cmd) {
                em.getComponentForEntity('UIElement', btn).onclick = function () {
                    boc.utils.createEvent(
                        new bbq.events.CommandEvent({ action: 'hideCommands' }),
                        em
                    );
                    boc.utils.createEvent(
                        new bbq.events.MapSelectEvent({ action: 'lockCursor' }),
                        em
                    );
                    cmd.execute({ entity: p.entity, map : map, sender: btn, command : cmd });
                };
            })(btnEnt, commands[i]);
        }

        ent.addListener('onKill', function () {
            for(var i = 0; i < btnEnts.length; i++) {
                em.killEntity(btnEnts[i]);
            }
        });
        return ent.id();
    } // createRingView
  
    var forPlayer = null;
    this.processTick = function (frameTime) {
        var commandEventEnts = em.getAllEntitiesWithComponent('CommandEvent');
        for (var i = 0; i < commandEventEnts.length; i++) {
            var commandEventEnt = commandEventEnts[i];
            var commandEvent = em.getComponentForEntity('CommandEvent', commandEventEnt);

            var commandsLocked = forPlayer != null && boc.utils.getCurrentPlayer(em) != forPlayer;
            if (commandEvent.action == 'lockCommands') {
                forPlayer = commandEvent.args ? commandEvent.args.forPlayer : null;
            }
            else if (!commandsLocked && commandEvent.action == 'showCommands') {
                // remove any commands previously shown
                var commandRings = em.getAllEntitiesWithComponent('CommandRing');
                if (commandRings) {
                    commandRings = commandRings.slice();
                    while (commandRings.length > 0) {
                        em.killEntity(commandRings.pop());
                    }
                }
                if (commandEvent.args.entity && boc.utils.getCurrentPlayer(em).hasEntity(commandEvent.args.entity)) {
                    commandEvent.args.map = map;
                    createRingView(commandEvent.args);
                }
            }
            else if (!commandsLocked && commandEvent.action == 'hideCommands') {
                // remove any commands previously shown
                var commandRings = em.getAllEntitiesWithComponent('CommandRing');
                if (commandRings) {
                    commandRings = commandRings.slice();
                    while (commandRings.length > 0) {
                        em.killEntity(commandRings.pop());
                    }
                }
            }
            else if (!commandsLocked && commandEvent.action == 'endTurn') {
                endTurn(commandEvent.args.callback, commandEvent.args.tutorialCallback);
            }
            boc.utils.consumeEvent(commandEventEnt, 'CommandEvent', em);
        } // i

    }; // processTick
}; //CommandSystem 