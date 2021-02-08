/// <reference path="../core/utils/EventEmitter.js" />
/// <reference path="../core/utils/methods.js" />
/// <reference path="../core/GameEngine.js" />
/// <reference path="./gamedata.js" />
/// <reference path="./map.js" />

ns('bbq');

/**
* A replay object.
* @constructor
*
* @param {string} gameId The gameid to see the replay.
* @param {object} options Optional settings.
* @param {function} onLoad Callback that is triggered when loading is complete.
*/
bbq.Replay = function (gameId, options, onLoad) {
    var isMobile = navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i);

    if (!options) {
        options = {};
    }

    var em = options.em || $em();
    this._em = em;
    this._gameEngine = null;
    this._mapId = null;
    this._mapObj = null;
    this._debug = options.__adminKey;
    this._stop = false;

    this.gameId = function () { return gameId; }        
    this.currentFrame = 0;
    this.maxFrames = 0;
    this.moves = null;
    this.players = null;
    this.neutralPlayer = null;    

    var canvas = options.canvasId ? $('#' + optons.canvasId)[0] : $('canvas')[0];
    if (!canvas) {
        throw new Error('No canvas found/given!');
    }

    this.camera = new boc.utils.Camera({
        xmin: 0,
        xmax: canvas.width,
        ymin: 0,
        ymax: canvas.height
    });


    var _this = this;

    var getGameObj = function () {
        boc.utils.getJson('get/games', { gameid: gameId, __adminkey : _this._debug }, function (data) {
            if (data) {
                if (data.status == 'ok') {
                    var result = data.result[0];
                    _this._mapId = result.mapid;
                    _this.moves = result.moves;
                    _this.maxFrames = result.moves.length;

                    // cycles thru the player states and creates entities
                    var players = [];
                    for (var p in result.state) {                        
                        var pState = result.state[p];
                        $em($em.create(p))
                            .add(new bbq.components.Player(
                                {
                                    id: p,
                                    food: pState.food,
                                    turn: pState.turn,
                                    team: pState.team,
                                    upkeep: pState.upkeep,
                                    buildings: [],
                                    units: [],
                                    summary: {},
                                    lastSeen: pState.lastSeen                                        
                                }
                            ));
                        if (p == '_neutral_') {
                            _this.neutralPlayer = p;
                        } else {
                            players.push(p);
                        }
                    } 

                    // figures out which player is first and which is second
                    var _pids = [];
                    for (var j = 0; j < players.length; j++) {
                        if (gameId.indexOf('_' + players[j] + '_') == -1) { throw "player not found in game."; }
                        _pids.push({ playerid: players[j], i: j });
                    }
                    _pids.sort(function (a, b) { return a.i - b.i; });
                    _this.players = [
                        _pids[0].playerid,
                        _pids[1].playerid
                    ];                    
                    
                    getMapObj();
                } else {
                    alert(data.result);
                }
            } else {
                throw new Error('error retrieving game ' + gameId);
            }
        });
    };

    var getMapObj = function () {
        var scaledWidth = Math.round(canvas.width / _this.camera.zoom);
        var scaledHeight = Math.round(canvas.height / _this.camera.zoom);
        var mapOptions = {
            'padding-left': scaledWidth / 2,
            'padding-right': scaledWidth / 2,
            'padding-top': scaledHeight / 2,
            'padding-bottom': scaledHeight / 2
        };

        if (bbq.maps[_this._mapId]) {
            _this._mapObj = new bbq.Map(_this._mapId, $em(), mapOptions);
            loadSystems();
        } else {
            boc.utils.getJson('get/maps', { mapid: _this._mapId, __adminkey: _this._debug }, function (data) {
                if (!data || data.status != 'ok') {
                    throw 'map ' + _this._mapId + ' not found!';
                } else {
                    bbq.maps[_this._mapId] = data.result[0];
                    _this._mapObj = new bbq.Map(_this._mapId, $em(), mapOptions);
                    loadSystems();
                }
            });
        }
    };

    var loadSystems = function () {
        // our systems. SO IMPORTANT!!   
        var renderSystem = new boc.systems.RenderSystem(em, canvas);
        renderSystem.camera(_this.camera);

        var cameraFollowSystem = new boc.systems.CameraFollowSystem(em);
        var animationSystem = new boc.systems.AnimationSystem(em);
        var mouseInputSystem = !isMobile ? new boc.systems.MouseInputSystem(em, canvas) : new boc.systems.TouchInputSystem(em, canvas);
        var lifespanSystem = new boc.systems.LifespanSystem(em);
        var panningCameraSystem = new boc.systems.PanningCameraSystem(em, renderSystem.camera());
        panningCameraSystem.bounds(_this._mapObj.bounds());
        var particleSystem = new boc.pfx.systems.BasicParticleSystem(em);
        var spriteAnimationSystem = new boc.systems.SpriteAnimationSystem(em);
        var identifySystem = new boc.systems.IdentifySystem(em, renderSystem.camera());
        var mapSelectSystem = new bbq.systems.MapSelectSystem(em, _this.camera);
        var parabolaSystem = new bbq.systems.ParabolicTranslationSystem(em);
        var fogSystem = new bbq.systems.FogSystem(em, _this._mapObj);
        var uiSystem = new boc.systems.UISystem(em);
        var unitSystem = new bbq.systems.UnitSystem(em);
        var moveSystem = new bbq.systems.MoveSystem(em, _this._mapObj);
        var attackSystem = new bbq.systems.AttackSystem(em, _this._mapObj);
        var healSystem = new bbq.systems.HealSystem(_this._mapObj);
        var revealSystem = new bbq.systems.RevealSystem(_this._mapObj);
        var unitCollisionSystem = new bbq.systems.UnitCollisionSystem(em, _this._mapObj);
        var delayedMethodSystem = new boc.systems.DelayedMethodSystem(em);
        var healthSystem = new bbq.systems.HealthSystem(em);
        var spineAnimationSystem = new boc.spine.SpineAnimationSystem();
        var replaySystem = new bbq.systems.ReplaySystem(_this._mapObj);

        _this._gameEngine = new boc.core.GameEngine([
            mouseInputSystem,
            panningCameraSystem,
            cameraFollowSystem,
            identifySystem,
            uiSystem,
            mapSelectSystem,
            replaySystem,
            unitSystem,
            moveSystem,
            attackSystem,
            healSystem,
            revealSystem,
            unitCollisionSystem,
            animationSystem,            
            parabolaSystem,
            spriteAnimationSystem,
            spineAnimationSystem,
            particleSystem,            
            fogSystem,
            healthSystem,
            delayedMethodSystem,
            renderSystem,
            lifespanSystem
        ]);

        _this._gameEngine.start();
        loadGameEntities();
        
    };

    var loadGameEntities = function () {
        var turnEnt = new boc.core.Entity({ description: 'turn', entityManager: em });
        turnEnt.addComponent(
            new bbq.components.Turn({
                playerid: _this.moves[0].playerid,
                number: 0
            })
        );        
        var players = _this.players.concat([_this.neutralPlayer]);

        var allUnits = [];
        var allBuildings = [];

        for (var i = 0; i < players.length; i++) {
            var startStateId = '_' + (players[i] == _this.neutralPlayer ? ('neutral') : (i)) + '_';
            var startState = _this._mapObj.startState[startStateId];

            var playerObj = boc.utils.getPlayer(players[i], em);

            // create buildings
            for (var b = 0; startState.buildings && b < startState.buildings.length; b++) {
                var bState = startState.buildings[b];
                var buildingEnt = bbq.buildings.createBuilding(bState, playerObj.team, em);
                playerObj.buildings.push(buildingEnt);
                allBuildings.push({ bState: bState, buildingEnt: buildingEnt });
            }

            // create units
            for (var u = 0; startState.units && u < startState.units.length; u++) {
                var uState = pState.units[u];
                var unitEnt = bbq.units.createUnit(uState, playerObj.team, em);
                playerObj.units.push(unitEnt);
                allUnits.push({ uState: uState, unitEnt: unitEnt });
                var level = bbq.units.getLevel(unitEnt);
                if (level > 1) {
                    bbq.units.levelUp(unitEnt, level, true);
                }
            }
        }

        // place order matters due to z-indexing
        for (var i = 0; i < allBuildings.length; i++) {
            var buildingEnt = allBuildings[i].buildingEnt;
            var bState = allBuildings[i].bState;
            _this._mapObj.place(buildingEnt, bState.location.x, bState.location.y);
        }

        for (var i = 0; i < allUnits.length; i++) {
            var uState = allUnits[i].uState;
            var unitEnt = allUnits[i].unitEnt;
            _this._mapObj.place(unitEnt, uState.location.x, uState.location.y);            
        }

        _this.fog(true);
        if (onLoad) {
            onLoad(_this);
        }
    };

    getGameObj();
};

/**
* Adds a system into the game.
* @param {object} system A System object.
*/
bbq.Replay.prototype.play = function () {
    this._stop = false;
    var _this = this;
    var playLoop = function () {
        if (_this._stop) {
            return;
        }
        setTimeout(function () {
            _this.forward(playLoop);
        }, 100);
    }
    playLoop();
};

/**
* Adds a system into the game.
* @param {object} system A System object.
*/
bbq.Replay.prototype.pause = function () {
    _this._gameEngine.pause();
};

/**
* Adds a system into the game.
* @param {object} system A System object.
*/
bbq.Replay.prototype.forward = function (onComplete) {
    boc.utils.createEvent(new bbq.components.ReplayScript(this.moves[this.currentFrame].playerid, this.moves[this.currentFrame].command, onComplete), this._em);
    this.currentFrame++;
};

bbq.Replay.prototype.back = function () {

};

/**
* Adds a system into the game.
* @param {object} system A System object.
*/
bbq.Replay.prototype.stop = function (onStop) {
    //this._gameEngine.stop();
    this._stop = true;
};

/**
* Adds a system into the game.
* @param {object} system A System object.
*/
bbq.Replay.prototype.speed = function (mult) {
    this._gameEngine.speed(mult);
};


/**
* Adds a system into the game.
* @param {object} system A System object.
*/
bbq.Replay.prototype.fog = function (p) {
    if (typeof (p) == 'boolean') {
        if (p) {
            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'clear' }), this._em);
            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), this._em);
            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw', forPlayer: boc.utils.getCurrentPlayer(this._em) }), this._em);
        } else {
            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'clear' }), this._em);
        }
    } else if (typeof (p) == 'string') {
        var player = boc.utils.getPlayer(p, this._em)
        if (player) {
            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), this._em);
            boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw', forPlayer: player }), this._em);
        }
    }
};

bbq.Replay.prototype.center = function (entId) {
};