/// <reference path="components.js" />
/// <reference path="systems.js" />
/// <reference path="commands.js" />
/// <reference path="algorithms.js" />
/// <reference path="unitset.js" />
/// <reference path="../core/pfx.js" />
/// <reference path="../core/components.js" />
/// <reference path="../core/entitysystem.js" />
/// <reference path="../core/systems.js" />
/// <reference path="../core/utils.js" />

/**
* request animation frame convenience
* http://paulirish.com/2011/requestanimationframe-for-smart-animating/
*/
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (callback) {
        var timeFrame = 1000 / 60;
        window.setTimeout(function () { callback(+new Date); }, timeFrame);
    };
})();

if (!window.bbq) { window.bbq = {}; }

bbq.zindex = {
    TERRAIN: 0,
    FRINGE : 5,
    PROPS: 10,
    UNITSANDBUILDINGS: 20,
    BUILDINGS: 1000,
    UNITS : 2000,
    FOG : 3000,
    OVERLAY : 4000,
    EFFECTS : 5000,
    CURSOR : 6000,
    UI : 7000
};

bbq.teams = ['Blue', 'Red', 'Yellow'];
bbq.lastFrameTime = 0;

bbq.VictoryConditions = {};
bbq.VictoryConditions.captureHQ = function (gameObj, vevent) {
    debugger;
    if (vevent.type != 'captureHQ') {
        return;
    }

    var player = vevent.player;
    if (typeof (player) == 'string') {
        player = boc.utils.getPlayer(player);
    }

    var capturedHQs = [];
		
    // find the enemy
    for (var j = 0; j < gameObj.players().length; j++) {
        var enemy = gameObj.players()[j];
        if (enemy == player || enemy.id == '_neutral_') continue;
		    
        var hasCappedHQ = true;
			
        // if the enemy still has an HQ, forget it, nothing happened
        for (var k = 0; k < enemy.buildings.length; k++) {
            if ($em(enemy.buildings[k]).comp('Building').type == "HQ") {
                hasCappedHQ = false;
                break;
            }							
        } //k
        if (hasCappedHQ)
            capturedHQs.push(enemy);
    } //j
		
    // if the # of captured HQs this player has is the # of opponents, then i've won!
    if (capturedHQs.length == gameObj.players().length - 2) { // -2 cuz we don't count the neutral player
        if (gameObj.onvictory) {
            gameObj.onvictory(player.id);
        }
    }	    
};

// { entityManager, canvas, gameState, autoStart, scale, speed, onLoad, hud }
bbq.Game = function (p)
{
    var _this = this;
    var canvas = p.canvas;
    var isMobile = navigator.userAgent.match(/Android/i)
                || navigator.userAgent.match(/webOS/i)
                || navigator.userAgent.match(/iPhone/i)
                || navigator.userAgent.match(/iPad/i)
                || navigator.userAgent.match(/iPod/i)
                || navigator.userAgent.match(/BlackBerry/i)
                || navigator.userAgent.match(/Mobile/i);

    var em = p.entityManager;
    boc.utils.setEntityManager(em);

    var _hud = p.hud;
    this.hud = function () {
        return _hud;
    };

    this.state = function () {
        return p.gameState.state;
    }; //state

    this.id = function () {
        return p.gameState.gameid;
    }; // id

    this.turn = function () { return p.gameState.turn; }
    this.winner = function () { return p.gameState.winner; }

    var _map = null; 
    this.map = function () {
        return _map;
    }; // map

    var _user = p.user;
    this.user = function () {
        return _user;
    };
    
    this.onvictory = null;
    this.victoryCondition = null;

    this.save = function (toConsole) {

    };

    // 0 lose 1 win
    this.end = function (type, callback) {        
        boc.utils.createEvent(
        new bbq.events.SaveEvent(
            'saveAll',
            _this.getCurrentPlayer().id,
            function () {
                var token = +new Date + '+' + type + '+' + _this.id();
                boc.utils.getJson('end/' + token, {}, function (json) {
                    if (json) {
                        if (json.status == 'ok') {
                            if (callback) {
                                callback(json.result.winner);
                            }
                        }
                        else {
                            alert(json.result);
                        }
                    } else {
                        alert('error ending game.');
                    }
                });
            }),
            em
        );        
    };

    this.collect = function (callback) {
        var token = +new Date + '+' + _this.id();
        boc.utils.getJson('collect/' + token, {}, function (json) {
            if (json.status == 'ok') {
                if (callback) {
                    callback(json.result);
                }
            } else {
                alert(json.result);
            }
        });
    };

    this.clearFog = function () {
        boc.utils.createEvent(new bbq.events.FogEvent({ action: 'clear' }), em);
    };
    
    // end turn for the current player
    this.endTurn = function (callback) {
        boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'endTurn', args: { callback: callback } }), em);
    };

    // updates the fog
    // updates the player overlay
    this.refresh = function () {

        // update the fog
        boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
        boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
        boc.utils.createEvent(new bbq.events.HudEvent({ action : 'update' }), em);        
        //var playerStatsEnt = em.getAllEntitiesWithComponent('PlayerStats')[0];
        //em.getComponentForEntity('PlayerStats', playerStatsEnt).target(boc.utils.getCurrentPlayer(em));
    };



    // our systems. SO IMPORTANT!!
    var camera = new boc.utils.Camera({
        xmin: 0,
        xmax: canvas.width,
        ymin: 0,
        ymax: canvas.height
    });    
    
    this.camera = function() {
    	return camera;
    };

    var renderSystem = null,
        cameraFollowSystem = null,
        animationSystem = null,
        mouseInputSystem = null,
        lifespanSystem = null,
        panningCameraSystem = null,
        particleSystem = null,
        spriteAnimationSystem = null,
        identifySystem = null,
        mapSelectSystem = null,
        parabolaSystem = null,
        fogSystem = null,
        uiSystem = null,
        unitSystem = null,
        commandSystem = null,
        moveSystem = null,
        unitCollisionSystem = null,
        hudSystem = null,
        attackSystem = null,
        healSystem = null,
        revealSystem = null,
        delayedMethodSystem = null,
        trainingSystem = null,
        healthSystem = null,
        upkeepSystem = null,
        saveSystem = null,
        victorySystem = null,
        spineAnimationSystem = null;

    var _stop = false;
    var _stopCallback = null;
    var _paused = false;
    var _reqAnim = null;

    var bcallback = function (e) {
        e.preventDefault();
    };

    this.touchCallback = bcallback;


    this.start = function () {
        document.addEventListener('touchmove', bcallback);
        var lastFrame = window.navigator.userAgent.toLowerCase().indexOf('firefox') >= 0 ? +new Date : bbq.lastFrameTime;
        var isFirstFrame = true;
        var isSecondFrame = false, isThirdFrame = false;
        var frames = 0;
        function loop(now) {
            
            if (frames <= 3) { // skip the first 4 frames. really annoying how browsers aren't consistent with 'now' value.                
                lastFrame = now;                
                frames++;
                _reqAnim = requestAnimFrame(loop);
                return;
            }
            //else if (frames <= 10) {
            //    console.log(now - lastFrame);
            //}

            if (_stop) {
                if (_stopCallback) {
                    _stopCallback();
                }
                if (window.cancelAnimationFrame) {
                    cancelAnimationFrame(_reqAnim);
                }
                bbq.lastFrameTime = lastFrame;
                return;
            }
            
            _reqAnim = requestAnimFrame(loop);
            var frameTime = now - lastFrame;
            

            mouseInputSystem.processTick(frameTime);
            panningCameraSystem.processTick(frameTime);
            cameraFollowSystem.processTick(frameTime);            

            if (!_paused) {
                identifySystem.processTick(frameTime);
                uiSystem.processTick(frameTime); // this guy will kill any identify events                
                mapSelectSystem.processTick(frameTime);
                unitSystem.processTick(frameTime);                
                commandSystem.processTick(frameTime);
                trainingSystem.processTick(frameTime);
                hudSystem.processTick(frameTime);
                moveSystem.processTick(frameTime);
                attackSystem.processTick(frameTime);
                healSystem.processTick(frameTime);
                revealSystem.processTick(frameTime);
                unitCollisionSystem.processTick(frameTime);
                animationSystem.processTick(frameTime);                
                parabolaSystem.processTick(frameTime);
                spriteAnimationSystem.processTick(frameTime);
                spineAnimationSystem.processTick(frameTime);
                particleSystem.processTick(frameTime);
                victorySystem.processTick(frameTime);                
                fogSystem.processTick(frameTime);
                healthSystem.processTick(frameTime);
                upkeepSystem.processTick(frameTime);
                delayedMethodSystem.processTick(frameTime);
            }            
            
            saveSystem.processTick(frameTime);
            renderSystem.processTick(frameTime);            
            
            if (!_paused) {
                lifespanSystem.processTick(frameTime); 
            }
                        
            //if (isThirdFrame) {
            //    console.log(frameTime);
            //    isThirdFrame = false;
            //}
            //if (isSecondFrame) {
            //    console.log(frameTime);
            //    isSecondFrame = false;
            //    isThirdFrame = true;
            //}
            //if (isFirstFrame) {
            //    console.log(frameTime);
            //    isFirstFrame = false;
            //    isSecondFrame = true;
            //}            

            lastFrame = now;
        } // loop

        loop(lastFrame);
    }; // start    

    this.stop = function (callback) {
        _stop = true;
        _stopCallback = callback;
        document.removeEventListener('touchmove', bcallback);
    }; // stop    

    this.pause = function (p) {
        if (p == undefined) { return _paused; }
        _paused = p;
    };

    var _scale = p.scale || 1.0;
    this.scale = function (s) {
        if (s == undefined) { return _scale; };
        _scale = s;
    }; // scale

    var _speed = p.speed || 1.0;
    this.speed = function (s) {
        if (s == undefined) { return _speed; };
        _speed = s;
    }; // speed

    this.setTimeout = function (callback, duration) {
        if (callback) {
            setTimeout(callback, duration / _speed);
        }
    }; // setTimeout

    var _players = [];    
    this.players = function () { return _players; }
    this.getPlayer = function(id) {
    	for (var i = 0; i < _players.length; i++) {
    		if (_players[i].id === id) {
    			return _players[i];
    		}
    	}
    	return null;
    };
    
    this.getCurrentPlayer = function () {
        for (var i = 0; i < _players.length; i++) {
            if (_players[i].id == this.turn()) {
                return _players[i];
            }
        }
        return null;
    }; //getCurrentPlayer        

    var firstTimeLoaded = true;
    // this assumes the SAME map. this goes all crazy if the gamestate is a different map.
    this.load = function (gameState, onLoad) {
        camera.update({ zoom: isMobile ? 1.0 : 1 });
        var scaledWidth = Math.round(p.canvas.width / camera.zoom);
        var scaledHeight = Math.round(p.canvas.height / camera.zoom);

        //_hud.on('endturn', function () {
        //    if (_this.getCurrentPlayer().id == SharedSession.user.playerid) {
        //        bbq.frontend.showYesNo('End turn', 'End your turn now?', function () {
        //            _this.endTurn(function () {

        //            });
        //        });
        //    } // show only if it's the user's turn
        //});

        if (gameState != null && typeof (gameState) != 'undefined') {
            _players = [];
            em.clear();
            p.hud.removeListener('trainback');
            p.hud.removeListener('trainok');
            p.gameState = gameState;

            var mapLoaded = function () {

                _map = new bbq.Map(
                    p.gameState.mapid,
                    em,
                    {
                        //'padding-left': camera.width() / 2, //p.canvas.width / 2,
                        //'padding-right': camera.width() / 2,//p.canvas.width / 2,
                        //'padding-top': camera.height() / 2,//p.canvas.height / 2,
                        //'padding-bottom': camera.height() / 2//p.canvas.height / 2
                        'padding-left': scaledWidth / 2,
                        'padding-right': scaledWidth / 2,
                        'padding-top': scaledHeight / 2,
                        'padding-bottom': scaledHeight / 2
                    }
                );

                // our systems. SO IMPORTANT!!   
                renderSystem = new boc.systems.RenderSystem(em, canvas);
                renderSystem.camera(camera);

                cameraFollowSystem = new boc.systems.CameraFollowSystem(em);
                animationSystem = new boc.systems.AnimationSystem(em);
                mouseInputSystem = !isMobile ? new boc.systems.MouseInputSystem(em, p.canvas) : new boc.systems.TouchInputSystem(em, p.canvas);
                lifespanSystem = new boc.systems.LifespanSystem(em);
                panningCameraSystem = new boc.systems.PanningCameraSystem(em, renderSystem.camera());
                panningCameraSystem.bounds(_this.map().bounds());
                particleSystem = new boc.pfx.systems.BasicParticleSystem(em);
                spriteAnimationSystem = new boc.systems.SpriteAnimationSystem(em);
                identifySystem = new boc.systems.IdentifySystem(em, renderSystem.camera());
                mapSelectSystem = new bbq.systems.MapSelectSystem(em, camera);
                parabolaSystem = new bbq.systems.ParabolicTranslationSystem(em);
                fogSystem = new bbq.systems.FogSystem(em, _this.map());
                uiSystem = new boc.systems.UISystem(em);
                unitSystem = new bbq.systems.UnitSystem(em);
                commandSystem = new bbq.systems.CommandSystem(em, p.canvas, _this.map());
                moveSystem = new bbq.systems.MoveSystem(em, _this.map());
                attackSystem = new bbq.systems.AttackSystem(em, _this.map());
                healSystem = new bbq.systems.HealSystem(_this.map());
                revealSystem = new bbq.systems.RevealSystem(_this.map());
                unitCollisionSystem = new bbq.systems.UnitCollisionSystem(em, _this.map());
                hudSystem = new bbq.systems.HudSystem(em, _this.hud());
                delayedMethodSystem = new boc.systems.DelayedMethodSystem(em);
                trainingSystem = new bbq.systems.TrainingSystem(em, renderSystem.camera(), _this.map(), { scale: 1 / camera.zoom, hud: _this.hud(), touchCallback: bcallback });
                healthSystem = new bbq.systems.HealthSystem(em);
                upkeepSystem = new bbq.systems.UpkeepSystem(em);
                saveSystem = new bbq.systems.SaveSystem(_this, em);
                victorySystem = new bbq.systems.VictorySystem(_this, em);
                spineAnimationSystem = new boc.spine.SpineAnimationSystem();

                // setup code    

                // place units
                var allUnits = [];
                var allBuildings = [];
                for (var playerid in p.gameState.state) {
                    var pState = p.gameState.state[playerid];
                    var playerEnt = new boc.core.Entity({ description: playerid, entityManager: em });
                    var unitSet = new bbq.UnitSet(pState.team, pState.unitSet || ['SpearWarrior', 'DartBlower', 'Scout', 'Enforcer', 'Harvester', 'Catapult']); // default
                    playerEnt.addComponent(
                        new bbq.components.Player(
                            {
                                id: playerid,
                                food: pState.food,
                                turn: pState.turn,
                                team: pState.team,
                                upkeep: pState.upkeep,
                                buildings: [],
                                units: [],
                                summary: {},
                                lastSeen: pState.lastSeen,
                                unitSet: unitSet
                            }
                        )
                    );
                    _players.push(playerEnt.Player);

                    // TODO: buffs

                    // create the buildings
                    if (pState.buildings) {
                        for (var i = 0; i < pState.buildings.length; i++) {
                            var bState = pState.buildings[i];
                            var buildingEnt = bbq.buildings.createBuilding(bState, playerEnt.Player.team, em);
                            playerEnt.Player.buildings.push(buildingEnt);
                            allBuildings.push({ bState: bState, buildingEnt: buildingEnt });
                            //place these later
                            //_map.place(buildingEnt, bState.location.x, bState.location.y);
                        } // i
                    }

                    // create the units
                    if (pState.units) {
                        for (var i = 0; i < pState.units.length; i++) {
                            var uState = pState.units[i];
                            var unitEnt = bbq.units.createUnit(uState, playerEnt.Player.team, em);
                            playerEnt.Player.units.push(unitEnt);
                            allUnits.push({ uState: uState, unitEnt: unitEnt });
                            //_map.place(unitEnt, uState.location.x, uState.location.y);
                            //if (uState.state == 'inactive') {
                            //    if (_user && _user.playerid == _this.getCurrentPlayer().id) {
                            //        boc.utils.createEvent(
                            //            new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: unitEnt } }),
                            //            em
                            //        );
                            //    }
                            //}
                            var level = bbq.units.getLevel(unitEnt);
                            if (level > 1) {
                                bbq.units.levelUp(unitEnt, level, true);
                            }
                            //if (uState.options && uState.options.gatherTarget) {
                            //    new bbq.commands.Gather().execute({ entity: unitEnt, map: _this.map(), showIconOnly: true });
                            //}
                            //if (uState.options && uState.options.captureTarget) {
                            //    new bbq.commands.Capture().execute({ entity: unitEnt, map: _this.map(), showIconOnly: true });
                            //}
                        } // i
                    }
                } // each player

                for (var i = 0; i < allBuildings.length; i++) {
                    var buildingEnt = allBuildings[i].buildingEnt;
                    var bState = allBuildings[i].bState;
                    _map.place(buildingEnt, bState.location.x, bState.location.y);
                }
                for (var i = 0; i < allUnits.length; i++) {
                    var uState = allUnits[i].uState;
                    var unitEnt = allUnits[i].unitEnt;
                    _map.place(unitEnt, uState.location.x, uState.location.y);
                    if (uState.options && uState.options.gatherTarget) {
                        new bbq.commands.Gather().execute({ entity: unitEnt, map: _this.map(), showIconOnly: true });
                    }
                    if (uState.options && uState.options.captureTarget) {
                        new bbq.commands.Capture().execute({ entity: unitEnt, map: _this.map(), showIconOnly: true });
                    }
                }

                for (var i = 0; i < p.gameState.summary.players.length; i++) {
                    var playerSummary = p.gameState.summary.players[i];
                    var player = boc.utils.getPlayer(playerSummary.playerid);
                    if (player) {
                        player.summary = playerSummary;
                    }
                } //p

                // update turn
                var turnEnt = new boc.core.Entity({ description: 'turn', entityManager: em });
                turnEnt.addComponent(
                    new bbq.components.Turn({
                        playerid: _this.getCurrentPlayer().id,
                        number: _this.getCurrentPlayer().turn
                    })
                );

                // draw fog
                var userPlayer = null;
                if (_user) {
                    userPlayer = boc.utils.getPlayer(_user.playerid, em);
                }
                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update', forPlayer: userPlayer }), em);
                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw', forPlayer: userPlayer }), em);
                if (userPlayer) {
                    boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'lockCommands', args: { forPlayer: userPlayer } }), em);
                    if (userPlayer.id == _this.getCurrentPlayer().id) {
                        for (var u = 0; u < userPlayer.units.length; u++) {
                            if ($em(userPlayer.units[u]).comp('Unit').state == 'inactive') {
                                boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: userPlayer.units[u] } }), em);
                            }
                        } // u
                    }
                }

                // ui setup
                //var avOverlay = bbq.ui.createAvatarOverlay({
                //    playerid: userPlayer ? userPlayer.id : boc.utils.getCurrentPlayer(em).id,
                //    entityManager: em,
                //    x: renderSystem.camera().xmin,
                //    y: renderSystem.camera().ymin,
                //    followCamera: renderSystem.camera(),
                //    scale : 1/ camera.zoom 
                //});
                //$em(avOverlay).comp('Spatial').update({ scale: 1.0 });

                //console.log(scaledHeight);
                //var statsOverlay = bbq.ui.createStatsOverlay({
                //    entityManager: em,
                //    x: renderSystem.camera().xmin - 1,
                //    //y: renderSystem.camera().ymin + renderSystem.camera().height() * renderSystem.camera().zoom - 53 / renderSystem.camera().zoom, // TODO : adjust for scale
                //    //y: renderSystem.camera().ymin + renderSystem.camera().height() - 53 ,
                //    y: renderSystem.camera().ymin + (scaledHeight - 53 / camera.zoom),
                //    followCamera: renderSystem.camera(),
                //    scale: 1 / camera.zoom,
                //    map : _this.map()
                //});
                //$em(statsOverlay).comp('Spatial').update({ scale: 2.0 });
                //$em('Spatial').each(function (e, c) {
                //    c.update({ scale: 2.0 });
                //});
                boc.utils.createEvent(new bbq.events.HudEvent({ action: 'update' }), em);

                // center on the HQ
                if (userPlayer && firstTimeLoaded) {
                    for (var b = 0; b < userPlayer.buildings.length; b++) {
                        var buildingComp = $em(userPlayer.buildings[b]).comp('Building');
                        if (buildingComp && buildingComp.type === 'HQ') {
                            boc.utils.centerCamera(camera, userPlayer.buildings[b]);
                            break;
                        }
                    }
                }
                firstTimeLoaded = false;
                if (onLoad) {
                    onLoad(_this);
                }
            }; // mapLoaded

            if (bbq.maps[p.gameState.mapid]) {
                mapLoaded();
            } else {
                boc.utils.getJson('get/maps', { mapid: p.gameState.mapid }, function (data) {
                    if (!data || data.status != 'ok') {
                        throw 'map ' + p.gameState.mapid + ' not found!';
                    } else {
                        bbq.maps[p.gameState.mapid] = data.result[0];
                        mapLoaded();
                    }
                });
            }
        }// if gameState
    } // load
    window.gCamera = camera;
    this.load(p.gameState, p.onLoad);
};

if (!boc.utils) { boc.utils = {}; }

boc.utils.getCurrentPlayer = function (em) {
    if (!em) { em = boc.utils._em; }
    var turn = em.getComponentForEntity('Turn', em.getAllEntitiesWithComponent('Turn')[0]);
    var players = em.getAllComponents('Player');
    for (i = 0; i < players.length; i++) {
        if (players[i].id == turn.playerid) {
            return players[i];
        }
    }
    return null;
}; // getCurrentPlayer

boc.utils.getPlayer = function (playerid, em) {
    if (!em) { em = boc.utils._em; }
    var players = em.getAllComponents('Player');
    for (i = 0; i < players.length; i++) {
        if (players[i].id == playerid) {
            return players[i];
        }
    }
}; //getPlayer

boc.utils.createHitEffect = function (x, y, em) {
    if (!em) { em = boc.utils._em; }
    var entity = em.createEntity();
    $em(entity)
        .add(new boc.components.Spatial({ x: x, y: y, z: bbq.zindex.EFFECTS, width: 1, height: 1 }))
        .add(new boc.pfx.components.Emitter({
            particleFactory: new boc.pfx.particleFactories.FadingStarFactory(em, 20),
            startVector: { x: 0, y: -1 },
            startVelocity: 150, // pixels per sec
            accelerationVector: { x: 0, y: 0.05 },
            emitRadius: 180,
            particleDuration: 500, // ms
            particlesPerSecond: 30
        }))
        .add(new boc.components.Lifespan({ duration: 200 }));
    //boc.utils.createEvent(new boc.pfx.components.EmitterBurstEvent({ target: entity, count: 10 }), em);
    return entity;
}; //createHitEffect

boc.utils.createSmokeEffect = function (x, y, em) {
    if (!em) { em = boc.utils._em; }
    var entity = em.createEntity();
    $em(entity)
        .add(new boc.components.Spatial({ x: x, y: y, z: bbq.zindex.EFFECTS, width: 1, height: 1 }))
        .add(new boc.pfx.components.Emitter({
            particleFactory: new boc.pfx.particleFactories.SmokeFactory(em, 50),
            startVector: { x: 0, y: 1 },
            startVelocity: 100, // pixels per sec
            accelerationVector: { x: 0, y: -0.075 },
            emitRadius: 225,
            particleDuration: 500, // ms
            particlesPerSecond: 100
        }))
        .add(new boc.components.Lifespan({ duration: 500 }));
    //boc.utils.createEvent(new boc.pfx.components.EmitterBurstEvent({ target: entity, count: 10 }), em);
    return entity;
}; //createHitEffect

boc.utils.createScrollingDrawable = function (drawable, x, y, options) {
    if (!options) { options = {}; }
    if (!options.easing) { options.easing = 'linearTween'; }
    if (!options.duration) { options.duration = 1000; }

    var ent = $em.create();
    $em(ent)
        .add(new boc.components.Spatial({ x: x, y: y, z: bbq.zindex.OVERLAY, width: 9, height: 13 }))
        .add(drawable)
        .add(new boc.components.Animation({
            componentName: 'Spatial',
            propertyDeltas: { y: -50 },
            duration: options.duration,
            easing: options.easing,
            state: boc.constants.ANIMATION_PLAYING
        }))
        .add(new boc.components.Lifespan({ duration: options.duration }));

    return ent;
};