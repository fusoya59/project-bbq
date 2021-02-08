/// <reference path="../../core/utils/EventEmitter.js" />
/// <reference path="../../core/utils/methods.js" />
/// <reference path="../../core/GameEngine.js" />
/// <reference path="../gamedata.js" />
/// <reference path="../map.js" />

ns('bbq.systems');

bbq.systems.ReplaySystem = function (map) {
    this.map = map;
};

bbq.systems.ReplaySystem.prototype.processTick = function (frameTime) {
    var _this = this;
    $em('ReplayScript').each(function (e, c) {
        var player = boc.utils.getPlayer(c.playerId, $em());
        if (c.script == 'e') { // end this player's turn            
            var allPlayers = $em().getAllComponents('Player');

            // find the next player
            var nextTeamIndex = (bbq.teams.indexOf(player.team) + 1) % bbq.teams.length;
            var nextPlayer = null;
            while (!nextPlayer) {
                for (var j = 0; j < allPlayers.length; j++) {
                    if (allPlayers[j].id == player.id) {
                        continue;
                    }
                    if (allPlayers[j].team == bbq.teams[nextTeamIndex]) {
                        nextPlayer = allPlayers[j];
                    }
                }
                nextTeamIndex = (nextTeamIndex + 1) % bbq.teams.length;
            }
            var turnEnt = $em('Turn').first();
            $em(turnEnt).comp('Turn').playerid = nextPlayer.id;
            $em(turnEnt).comp('Turn').number = nextPlayer.turn;            
            player = nextPlayer;
            if (c.onComplete) { c.onComplete(); }
        } else {
            var scriptParts = /\(([\d,]+)\)(\w+)(\(.+\))?/.exec(c.script);
            var strMapTile = scriptParts[1].split(',');
            var tile = { x: +strMapTile[0], y: +strMapTile[1] };
            switch (scriptParts[2]) {                
                case 'a':
                case 'r':
                    if (scriptParts[3]) {
                        var moveScript = /\(([\d,]+)\)/.exec(scriptParts[3])[1];
                        var dstTile = moveScript.split(',');
                        dstTile = { x: +dstTile[0], y: +dstTile[1] };
                        var srcEnt = _this.map.getEntities(tile.x, tile.y, 'Unit')[0];
                        var dstEnt = _this.map.getEntities(dstTile.x, dstTile.y, 'Unit')[0];
                        if (srcEnt && dstEnt) {
                            var srcDmg = $em(srcEnt).comp('Attack').damage;
                            boc.utils.createEvent(new bbq.events.CommandEvent({
                                action: 'attackEntity',
                                args: {
                                    src: srcEnt,
                                    dst: dstEnt,
                                    damage: srcDmg,
                                    onAttackEnd: c.onComplete
                                }
                            }), $em());
                        } else {
                            if (c.onComplete) {
                                c.onComplete();
                            }
                        }
                    }
                    break;
                case 'm':
                    if (scriptParts[3]) {
                        var moveScript = /\('(\w+)'\)/.exec(scriptParts[3])[1];                        
                        var tx = tile.x, ty = tile.y;
                        var tilePath = [tx + ',' + ty];
                        for (var k = 0; k < moveScript.length; k++) {                            
                            if (moveScript[k] == 'e') {
                                tx++;
                            } else if (moveScript[k] == 'w') {
                                tx--;
                            } else if (moveScript[k] == 'n') {
                                ty--;
                            } else if (moveScript[k] == 's') {
                                ty++;
                            }
                            tilePath.push(tx + ',' + ty);
                        }
                        boc.utils.createEvent(
                            new bbq.events.CommandEvent({
                                action: 'moveEntity',
                                args: { entity : _this.map.getEntities(tile.x, tile.y, 'Unit')[0], path : tilePath, onMoveEnd: c.onComplete }
                            }), $em()
                        );
                    }
                    break;
                case 't':
                    if (scriptParts[3]) {
                        var unitType = /\('(\w+)'\)/.exec(scriptParts[3])[1];
                        var unitEnt = bbq.units.createUnit({ type: unitType }, player.team, $em());
                        player.units.push(unitEnt);
                        _this.map.place(unitEnt, tile.x, tile.y);
                    }
                    if (c.onComplete) { c.onComplete(); }
                    break;
                case 'h':
                    var ent = _this.map.getEntities(tile.x, tile.y, 'Unit')[0];
                    if (ent) {
                        new bbq.commands.Hold($em()).execute({ entity: ent });
                    }
                    if (c.onComplete) { c.onComplete(); }
                    break;
                case 'g':
                    var ent = _this.map.getEntities(tile.x, tile.y, 'Unit')[0];
                    if (ent) {
                        new bbq.commands.Gather($em()).execute({ entity: ent, map : _this.map });
                    }
                    if (c.onComplete) { c.onComplete(); }
                    break;
                case 'c':
                    var ent = _this.map.getEntities(tile.x, tile.y, 'Unit')[0];
                    if (ent) {
                        new bbq.commands.Capture($em()).execute({ entity: ent, map: _this.map });
                    }
                    if (c.onComplete) { c.onComplete(); }
                    break;
                case 'hl':
                    if (scriptParts[3]) {
                        var moveScript = /\(([\d,]+)\)/.exec(scriptParts[3])[1];
                        var dstTile = moveScript.split(',');
                        dstTile = { x: +dstTile[0], y: +dstTile[1] };
                        var srcEnt = _this.map.getEntities(tile.x, tile.y, 'Unit')[0];
                        var dstEnt = _this.map.getEntities(dstTile.x, dstTile.y, 'Unit')[0];
                        var srcHeal = $em(srcEnt).comp('Heal').points;
                        var healEvent = new bbq.events.HealEvent(srcEnt);
                        healEvent.dstEntity = dstEnt;
                        healEvent.healPoints = srcHeal;
                        healEvent.onComplete = c.onComplete;
                    }
                    break;
                case 'rv':
                    if (scriptParts[3]) {
                        var moveScript = /\(([\d,]+)\)/.exec(scriptParts[3])[1];
                        var dstTile = moveScript.split(',');
                        dstTile = { x: +dstTile[0], y: +dstTile[1] };
                        var srcEnt = _this.map.getEntities(tile.x, tile.y, 'Unit')[0];
                        var dstEnt = _this.map.getEntities(dstTile.x, dstTile.y, 'Terrain')[0];

                        var x = $em(dstEnt).comp('MapElement').x;
                        var y = $em(dstEnt).comp('MapElement').y;
                        var radius = $em(srcEnt).comp('Reveal').radius; 
                        
                        var target = $em.create();
                        $em(target)
                                .add(new boc.components.Spatial({
                                    x: 0,
                                    y: 0,
                                    z: bbq.zindex.OVERLAY,
                                    width: _this.map.tileWidth(),
                                    height: _this.map.tileHeight()
                                }))
                                .add(new bbq.components.RevealSpot(x, y, radius, player.id));

                        _this.map.place(target, x, y);

                        var revealEvent = new bbq.events.RevealEvent(srcEnt);
                        revealEvent.dstEntity = target;
                        revealEvent.onComplete = c.onComplete;
                        boc.utils.createEvent(revealEvent, $em());
                    }
                    break;
            }
            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), $em());
            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw', forPlayer: player }), $em());

        }
        boc.utils.consumeEvent(e, c.className(), $em());
    });
};