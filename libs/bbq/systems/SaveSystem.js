ns('bbq.systems');

// saves the current players state and/or move set
bbq.systems.SaveSystem = function (gameObj, em) {

    // serialize to a state object
    function serializePlayer(player) {
        var toReturn = {
            food: player.food,
            turn: player.turn,
            team: player.team,
            unitSet: player.unitSet,
            upkeep: player.upkeep,
            buildings: [],
            units: [],
            lastSeen: player.lastSeen
        };

        // TODO: player buffs
        for (var b = 0; b < player.buildings.length; b++) {
            var building = player.buildings[b];
            var btile = $em(building).comp('MapElement');

            //TODO: building buffs
            var buffArr = undefined;
            //if (building.Buffable && building.Buffable.buffs.length > 0) {
            //    buffArr = [];
            //    for (var z = 0; z < building.Buffable.buffs.length; z++) {
            //        var jsonBuff = BuffUtils.getBuffJson(building.Buffable.buffs[z]);
            //        buffArr.push(jsonBuff);
            //    } // z
            //}
            var debuffArr = undefined;
            //if (building.Debuffable && building.Debuffable.debuffs.length > 0) {
            //    debuffArr = [];
            //    for (var z = 0; z < building.Debuffable.debuffs.length; z++) {
            //        var jsonDebuff = BuffUtils.getDebuffJson(building.Debuffable.debuffs[z]);
            //        debuffArr.push(jsonDebuff);
            //    } // z
            //}
            var bstate = {
                type: $em(building).comp('Building').type.replace(/\s/g, ''),
                location: { x: btile.x, y: btile.y },
                turnsUntilCapture: $em(building).comp('Building').turnsUntilCapture,
                buffs: buffArr,
                debuffs: debuffArr
            };
            toReturn.buildings.push(bstate);
        } // b

        for (var u = 0; u < player.units.length; u++) {
            var unit = player.units[u];
            var utile = $em(unit).comp('MapElement');
            var uoptions = {};
            if ($em(unit).comp('Unit').type == 'Harvester') {
                uoptions.gatherTarget = $em(unit).has('Gather');
                uoptions.captureTarget = $em(unit).has('Capture');
            }
            uoptions.kills = $em(unit).comp('Unit').kills;

            // TODO: unit buffs
            var buffArr = undefined;
            //if (unit.Buffable && unit.Buffable.buffs.length > 0) {
            //    buffArr = [];
            //    for (var z = 0; z < unit.Buffable.buffs.length; z++) {
            //        var jsonBuff = BuffUtils.getBuffJson(unit.Buffable.buffs[z]);
            //        buffArr.push(jsonBuff);
            //    } // z
            //}
            var debuffArr = undefined;
            //if (unit.Debuffable && unit.Debuffable.debuffs.length > 0) {
            //    debuffArr = [];
            //    for (var z = 0; z < unit.Debuffable.debuffs.length; z++) {
            //        var jsonDebuff = BuffUtils.getDebuffJson(unit.Debuffable.debuffs[z]);
            //        debuffArr.push(jsonDebuff);
            //    } // z
            //}
            var ustate = {
                type: $em(unit).comp('Unit').type.replace(/\s/g, ''),
                location: { x: utile.x, y: utile.y },
                state: $em(unit).comp('Unit').state,
                hp: $em(unit).comp('Health').current,
                options: uoptions,
                buffs: buffArr,
                debuffs: debuffArr
            }
            toReturn.units.push(ustate);
        } // u

        return toReturn;
    } // serializePlayer

    function saveGameState(playerid, onSave) {
        //var player = boc.utils.getPlayer(playerid);
        //if (!player) { throw 'player ' + playerid + ' not found'; }      
        var turnEnt = $em('Turn').all()[0];
        var newGameState =
		{
		    turn: $em(turnEnt).comp('Turn').playerid,
		    state: {}, // playerState
		    lastupdate: +new Date,
		    summary: { players: [] }
		};

        for (var i = 0; i < gameObj.players().length; i++) {
            var pl = gameObj.players()[i];
            newGameState.summary.players.push(pl.summary);
            newGameState.state[pl.id] = serializePlayer(pl);
        }

        //console.log(newGameState);
        var query = JSON.stringify({ gameid: gameObj.id() });
        var document = JSON.stringify(newGameState);
        boc.utils.getJson(
            'transact/update/games',
            {
                query: query,
                document: document
            },
            function (json) {
                if (onSave) {
                    onSave();
                }
            }
        ); // getJson
    } // saveGameState

    function saveMoves(playerid, onSave) {
        var moves = [];
        var player = boc.utils.getPlayer(playerid);
        if (!player) { throw 'player ' + playerid + ' not found'; }
        for (var i = 0; i < player.moves.length; i++) {
            moves.push({ playerid: player.id, command: player.moves[i], turn: player.turn });
        }

        var queryDoc = {
            query: JSON.stringify({ gameid: gameObj.id() }),
            document: JSON.stringify({ $pushAll: { moves: moves } })
        };

        boc.utils.getJson('transact/update/games', queryDoc, function (json) {
            //console.log(moves);
            player.moves = []; //player.clearMoves();
            //console.log(json);              
            if (onSave) {
                onSave();
            }
        });

        //console.log(moves);               
    } //saveMoves

    this.processTick = function (frameTime) {
        $em('SaveEvent').each(function (e, c) {
            if (c.action == 'saveAll') {
                saveGameState(
                    c.playerid,
                    function () {
                        //debugger;
                        saveMoves(c.playerid, c.onSaveComplete);
                    }
                );
            }
            else if (c.action == 'saveGameState') {
                saveGameState(c.playerid, c.onSaveComplete);
            }
            else if (c.action == 'saveMoves') {
                saveMoves(c.playerid, c.onSaveComplete);
            }
            boc.utils.consumeEvent(e, c.className(), em);
        });
    }; // processTick
}; // SaveSystem