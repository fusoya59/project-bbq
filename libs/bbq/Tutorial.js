/// <reference path="../core/utils/EventEmitter.js" />
/// <reference path="../core/utils/methods.js" />
/// <reference path="../core/GameEngine.js" />
/// <reference path="./gamedata.js" />
/// <reference path="./map.js" />

ns('bbq');

bbq.tutorialGameState = {
    gameid: "game_$playerid_computer_1234",
    lastupdate: 1378848826338,
    mapid: "tutorial",
    turn: "$playerid",
    winner: null,
    state: {
        "$playerid": {
            "food": 500,
            "turn": 1,
            "team": "Blue",
            "unitSet": {
                "0": "Harvester",
                "selected_": -1,
                "length": 1
            },
            "upkeep": false,
            "buildings": [
                       { "type": "HQ", "location": { "x": 1, "y": 8 }, "turnsUntilCapture": 3 },
                       { "type": "Hut", "location": { "x": 1, "y": 5 }, "turnsUntilCapture": 2 }
            ],
            "units": [],
            "lastSeen": {}
        },
        "Computer": {
            "food": 0,
            "turn": 1,
            "team": "Red",
            "unitSet": {
                "0": "SpearWarrior",
                "1": "DartBlower",
                "2": "Scout",
                "3": "Harvester",
                "4": "Enforcer",
                "5": "Catapult",
                "selected_": 3,
                "length": 6
            },
            "upkeep": false,
            "buildings": [
              { "type": "HQ", "location": { "x": 8, "y": 1 }, "turnsUntilCapture": 3 },
                  { "type": "Hut", "location": { "x": 8, "y": 5 }, "turnsUntilCapture": 2 }
            ],
            "units": [],
            "lastSeen": {}
        },
        "_neutral_": {
            "food": 0,
            "turn": 0,
            "team": "Neutral",
            "unitSet": {
                "0": "SpearWarrior",
                "1": "DartBlower",
                "2": "Scout",
                "3": "Enforcer",
                "4": "Harvester",
                "5": "Catapult",
                "selected_": -1,
                "length": 6
            },
            "upkeep": false,
            "buildings": [
              { "type": "Hut", "location": { "x": 1, "y": 1 }, "turnsUntilCapture": 2 },
              { "type": "Farm", "location": { "x": 8, "y": 8 }, "turnsUntilCapture": 2 }
            ],
            "units": [],
            "lastSeen": {}
        }
    },
    "summary": {
        "players": [
          {
              "playerid": "$playerid",
              "team": "Blue",
              "unitsProduced": 0,
              "unitsKilled": 0,
              "unitsLost": 0,
              "buildingsCaptured": 0,
              "buildingsLost": 0,
              "foodCollected": 0,
              "foodConsumed": 0
          },
          {
              "playerid": "computer",
              "team": "Red",
              "unitsProduced": 0,
              "unitsKilled": 0,
              "unitsLost": 0,
              "buildingsCaptured": 0,
              "buildingsLost": 0,
              "foodCollected": 0,
              "foodConsumed": 0
          },
          {}
        ]
    }
};

/**
* A replay object.
* @constructor
*
* @param {string} gameId The gameid to see the replay.
* @param {object} options Optional settings.
* @param {function} onLoad Callback that is triggered when loading is complete.
*/
bbq.Tutorial = function (gameId, options, onLoad) {
    var isMobile = navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Mobile/i);

    if (!options) {
        options = {};
    }

    var em = options.entityManager || $em();
    var hud = options.hud;    
    var turn = 0;
    
    this._em = em;
    this._gameEngine = null;
    this._mapId = null;
    this._mapObj = null;
    this._debug = options.__adminKey;
    this._stop = false;

    this.victoryCondition = null ; 

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
        var result = bbq.tutorialGameState;
        _this._mapId = result.mapid;
        
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
                        lastSeen: pState.lastSeen,
                        unitSet : new bbq.UnitSet(pState.team, pState.unitSet || ['SpearWarrior', 'DartBlower', 'Scout', 'Enforcer', 'Harvester', 'Catapult'])
                    }
                ));
            if (p == '_neutral_') {
                _this.neutralPlayer = p;
            } else {
                players.push(p);
            }
        }
        
        getMapObj();                
    };

    var getMapObj = function () {
        _this.camera.update({ zoom: isMobile ? 1.0 : 1 });
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
        var commandSystem = new bbq.systems.CommandSystem(em, canvas, _this._mapObj);
        var trainingSystem = new bbq.systems.TrainingSystem(em, _this.camera, _this._mapObj, options);
        var hudSystem = new bbq.systems.HudSystem(em, options.hud);
        var victorySystem = new bbq.systems.VictorySystem(_this, em);
        var waitForClickSystem = new boc.systems.WaitForClickSystem(em);

        _this._gameEngine = new boc.core.GameEngine([
            mouseInputSystem,
            waitForClickSystem,
            panningCameraSystem,
            cameraFollowSystem,
            identifySystem,
            uiSystem,
            mapSelectSystem,
            replaySystem,
            unitSystem,
            commandSystem,
            trainingSystem,
            hudSystem,
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
            victorySystem,
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
                playerid: bbq.tutorialGameState.turn,
                number: 0
            })
        );
        var players = [bbq.tutorialGameState.turn, 'Computer', '_neutral_'];// _this.players.concat([_this.neutralPlayer]);

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
        boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), _this._em);
        boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw', forPlayer: boc.utils.getCurrentPlayer(_this._em) }), _this._em);
        if (onLoad) {
            onLoad(_this);
        }
    };

    getGameObj();
    
    var tutArrow = $em.create('tutorial_arrow');
    $em(tutArrow).add(new boc.components.Spatial({ x: 95, y: 200, z: bbq.zindex.OVERLAY, width: 56, height: 63 }))
                 .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('assets/graphics/tutorial_arrow.png'), visible: true }));

    // tutorial magic
    var toastWindow = bbq.frontend.toast('Select the hut and Train', { delay: -1 });

    // center on the hut
    boc.utils.centerCamera(this.camera, boc.utils.getCurrentPlayer().buildings[1]);
    
    var pointToEndTurn = function() {
    	// position arrow right below the end turn button
    	$em(tutArrow).comp('DrawableSprite').visible = true;
        $em(tutArrow).comp('Spatial').angle = boc.utils.degToRad(180);
        $em(tutArrow).comp('Spatial').update({ x: _this.camera.xmax - 155, y: _this.camera.ymin + 70 });
        if (!$em(tutArrow).has('CameraFollow')) {
        	$em(tutArrow).add(new boc.components.CameraFollow({ camera: _this.camera }));	
        }        
    }; // pointToEndTurn

    var pointToPause = function () {
        // position arrow right below the end turn button
        $em(tutArrow).comp('DrawableSprite').visible = true;
        $em(tutArrow).comp('Spatial').angle = boc.utils.degToRad(180);
        $em(tutArrow).comp('Spatial').update({ x: _this.camera.xmax - 105, y: _this.camera.ymin + 70 });
        if (!$em(tutArrow).has('CameraFollow')) {
            $em(tutArrow).add(new boc.components.CameraFollow({ camera: _this.camera }));
        }
    }; // pointToPause
    
    var pointToUpperHut = function() {
    	$em(tutArrow).comp('DrawableSprite').visible = true;
    	$em(tutArrow).comp('Spatial').angle = 0;
        $em(tutArrow).comp('Spatial').update({ x: 95, y: 5 });
    }; // pointToUpperHut
    
    var pointToLowerHut = function() {
    	$em(tutArrow).comp('DrawableSprite').visible = true;
    	$em(tutArrow).comp('Spatial').angle = 0;
        $em(tutArrow).comp('Spatial').update({ x: 95, y: 195 });
    }; // pointToUpperHut
    
    var endTurn = function(callback) {
    	boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'endTurn', args: { tutorialCallback : callback } }), em);
    }; // endTurn
    
    var clearHudEvents = function() {
    	hud.removeListener('trainback');
    	hud.removeListener('open');
    	hud.removeListener('endturn');
    };
    
    var canEndTurn1 = false;
    hud.on('trainback', function() {
    	if (turn === 0) {
    		toastWindow.remove();
    		var currP = boc.utils.getCurrentPlayer();
    		if (currP.units.length === 0) {
				toastWindow = bbq.frontend.toast('Select the Hut and Train', { delay : -1});    			
    		}
    		else { // successfully trained    		    
    		    showToast('Notice your food decreased after training your Harvester.', -1, null, true);

    		    // point to under food 
    		    $em(tutArrow).comp('DrawableSprite').visible = true;
    		    $em(tutArrow).comp('Spatial').angle = boc.utils.degToRad(135);
    		    $em(tutArrow).comp('Spatial').update({ x: _this.camera.xmin + 60, y: _this.camera.ymin + 80 });
    		    $em(tutArrow).add(new boc.components.CameraFollow({ camera: _this.camera }));
    		    boc.utils.waitForClick(function () {
    		        showToast('Food increases every turn for each berry and building you own.', -1, null, true);
			
					boc.utils.waitForClick(function () {
						// position arrow right below the end turn button
						$em(tutArrow).comp('Spatial').angle = boc.utils.degToRad(180);
						$em(tutArrow).comp('Spatial').update({ x: _this.camera.xmax - 155, y: _this.camera.ymin + 70 });
						//$em(tutArrow).add(new boc.components.CameraFollow({ camera: _this.camera }));
						toastWindow.remove();
						toastWindow = bbq.frontend.toast('Hit End Turn', { delay: -1 });
						canEndTurn1 = true;
					});
    		    });
    		    
    		}
    		
    	}
    });
    hud.on('open', function() {
    	toastWindow.remove();
    	toastWindow = bbq.frontend.toast('Select the Harvester and then click Train', { delay : -1});
    });
    hud.on('endturn', function() {
        if (turn === 0 && boc.utils.getCurrentPlayer().units.length > 0 && canEndTurn1) {
            var turn1Callback = function () {
                // only allow it to move initially
                var currP = boc.utils.getCurrentPlayer();
                var harvester = currP.units[0];
                var harvesterCommands = $em(harvester).comp('Commandable').commands;
                for (var i = 0; i < harvesterCommands.length; i++) {
                    if (harvesterCommands[i].name() === 'Attack' || harvesterCommands[i].name() === 'Hold') {
                        harvesterCommands[i].disabled(true);
                    } else if (harvesterCommands[i].name() === 'Move') {
                        harvesterCommands[i].moveTiles = ['1,1']
                        harvesterCommands[i].onMoveEnd = function () {
                            $em(tutArrow).comp('DrawableSprite').visible = false;
                            toastWindow.remove();
                            toastWindow = bbq.frontend.toast('Excellent. Now Capture the hut!', { delay: -1 });
                            this.onMoveEnd = null;
                        }
                    } else if (harvesterCommands[i].name() === 'Capture') {
                        harvesterCommands[i].onCaptureEnd = function () {
                            toastWindow.remove();
                            toastWindow = bbq.frontend.toast('Huts take 2 turns to capture. Why don\'t you train a Scout in the meantime?', { delay: -1 });
                            $em(tutArrow).comp('Spatial').update({ x: 95, y: 195 });
                            $em(tutArrow).comp('DrawableSprite').visible = true;
                            var currP = boc.utils.getCurrentPlayer();
                            currP.unitSet = new bbq.UnitSet(currP.team, ['Scout']);
                            hud.removeListener('open');
                            hud.removeListener('trainback');
                            hud.removeListener('endturn');
                            hud.on('open', function () {
                                toastWindow.remove();
                                toastWindow = bbq.frontend.toast('Select the Scout and then click Train', { delay: -1 });
                            });
                            hud.on('trainback', function () {
                                if (currP.units.length === 1) {
                                    toastWindow.remove();
                                    toastWindow = bbq.frontend.toast('Click the hut to train a Scout', { delay: -1 });
                                    boc.utils.createEvent(
	                                    new bbq.events.MapSelectEvent({
	                                        action: 'unlockCursor',
	                                        args: {}
	                                    }),
	                                    em
	                                );
                                } else {
                                    showToast('Scouts have awesome vision and can move really far. Take advantage of it.', -1, null, true);
                                    boc.utils.waitForClick(function () {
                                        showToast('Nothing else to do. Hit end turn');
                                        // position arrow right below the end turn button
                                        $em(tutArrow).comp('Spatial').angle = boc.utils.degToRad(180);
                                        $em(tutArrow).comp('Spatial').update({ x: _this.camera.xmax - 155, y: _this.camera.ymin + 70 });
                                        $em(tutArrow).add(new boc.components.CameraFollow({ camera: _this.camera }));                                        
                                    });                                    
                                }
                            });
                            hud.on('endturn', function () {
                                if (currP.units.length === 2) {
                                    $em(tutArrow).comp('DrawableSprite').visible = false;
                                    $em(tutArrow).remove('CameraFollow');
                                    boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'endTurn', args: { tutorialCallback : turn2 } }), em);                                    
                                }                                
                            });
                        };
                    }
                }
                var hSpatial = $em(harvester).comp('Spatial');
                var tSpatial = $em(tutArrow).comp('Spatial');
                tSpatial.update({ x: hSpatial.x + 45, y: hSpatial.y - 55 });
                tSpatial.angle = 0;
                $em(tutArrow).comp('DrawableSprite').visible = true;

                var anim = new boc.components.Animation({
                    componentName: 'Spatial',
                    propertyDeltas: { y: -190 },
                    easing: 'linearTween',
                    duration: 2000,
                    state: boc.constants.ANIMATION_STOPPED
                });                
                $em(tutArrow).add(anim);
                boc.utils.createEvent(new boc.components.DelayedMethod(function() {
                    anim.state = boc.constants.ANIMATION_PLAYING;
                }, 1000), em, { duration: 2000 });
            };
            turn++;
            $em(tutArrow).comp('DrawableSprite').visible = false;
            $em(tutArrow).remove('CameraFollow');
            boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'endTurn', args: { } }), em);
            boc.utils.createEvent(
                new bbq.events.MapSelectEvent({
                    action: 'hideCursor'                    
                }),
                em
            );    
            boc.utils.createEvent(
                new bbq.events.MapSelectEvent({
                    action: 'lockCursor'                    
                }),
                em
            );

    		showToast('At this point your opponent is calculating a move', -1, null, true);
            
            boc.utils.waitForClick(function() {
            	showToast('Normally you would go back to the battle menu until it\'s your turn', -1, null, true);
				boc.utils.waitForClick(function() {
					showToast('But in this case it\'s a tutorial, so go ahead and move your unit next', -1, null, true);            	
					boc.utils.waitForClick(function() {
						showToast('Select your Harvester and then move to the upper hut.');
						boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'endTurn', args: { tutorialCallback: turn1Callback } }), em);
						boc.utils.createEvent(
							new bbq.events.MapSelectEvent({
								action: 'showCursor',
								args: {}
							}),
							em
						);
						boc.utils.createEvent(
							new bbq.events.MapSelectEvent({
								action: 'unlockCursor',
								args: {}
							}),
							em
						);                
					});
            	});
            });
			
    	}
    }); // on.endTurn

    var turn2 = function () {
        hud.removeListener('endturn');
        hud.removeListener('open');
        hud.removeListener('trainback');

        toastWindow.remove();
        showToast('It\'s been pretty quiet so far. Why don\'t you move to enemy territory?', -1, null, true);

        var enemyP = boc.utils.getCurrentPlayer();
        var unitEnt = bbq.units.createUnit({ type: 'SpearWarrior' }, enemyP.team, $em());
        $em(unitEnt).comp('DrawableSprite').visible = false;
        $em(unitEnt).comp('Health').current = 5;
        enemyP.units.push(unitEnt);
        _this._mapObj.place(unitEnt, 7, 5);
        
        unitEnt = bbq.units.createUnit({ type: 'SpearWarrior' }, enemyP.team, $em());
        $em(unitEnt).comp('DrawableSprite').visible = false;
        $em(unitEnt).comp('Health').current = 4;
        enemyP.units.push(unitEnt);
        _this._mapObj.place(unitEnt, 8, 1);        

        var turn2cb = function () {
            $em(tutArrow).comp('Spatial').angle = 0;
            $em(tutArrow).comp('Spatial').update({ x: 95, y: 195 });
            $em(tutArrow).comp('DrawableSprite').visible = true;
            toastWindow.remove();
            toastWindow = bbq.frontend.toast('Select your Scout and charge!', { delay: -1 });
            var anim = new boc.components.Animation({
                componentName: 'Spatial',
                propertyDeltas: { x: 350 },
                easing: 'linearTween',
                duration: 2000,
                state: boc.constants.ANIMATION_STOPPED
            });
            $em(tutArrow).remove('Animation');
            $em(tutArrow).add(anim);
            boc.utils.createEvent(new boc.components.DelayedMethod(function () {
                anim.state = boc.constants.ANIMATION_PLAYING;
            }, 1000), em, { duration: 2000 });

            var currP = boc.utils.getCurrentPlayer();
            var harvester = currP.units[0];
            // inactivate the harvester for now
            $em(harvester).comp('Unit').state = 'inactive';
            var scout = currP.units[1];
            var scoutCommands = $em(scout).comp('Commandable').commands;
            for (var i = 0; i < scoutCommands.length; i++) {
                if (scoutCommands[i].name() === 'Hold') {
                    scoutCommands[i].disabled(true);
                }
                else if (scoutCommands[i].name() === 'Move') {
                    scoutCommands[i].moveTiles = ['8,5'];
                    scoutCommands[i].onMoveEnd = turn2cb2;
                }
            }
        };

        // collided w/ some guy. now finish capturing the hut
        var turn2cb2 = function () {
            showToast('Whoops! Looks like you collided with a hidden enemy.', -1, null, true);
            $em(tutArrow).comp('DrawableSprite').visible = false;
            boc.utils.waitForClick(function () { 
				showToast('Enemies are hidden under fog of war.', -1, null, true); 
	            boc.utils.waitForClick(function () { 
					showToast('Tall grass like this one can be revealed only if your unit is beside it.', -1, null, true);
		            boc.utils.waitForClick(function () {
						showToast('Select your harvester and finish capturing that hut.', -1, null, true)
						$em(tutArrow).comp('Spatial').update({ x: 95, y: 5 });
						$em(tutArrow).comp('DrawableSprite').visible = true;
						boc.utils.waitForClick(function () {
							var currP = boc.utils.getCurrentPlayer();
							var harvester = currP.units[0];
							$em(harvester).comp('Unit').state = 'idle';
							var harvesterCommands = $em(harvester).comp('Commandable').commands;
							for (var i = 0; i < harvesterCommands.length; i++) {
								if (harvesterCommands[i].name() != 'Capture') {
									harvesterCommands[i].disabled(true);
								} else {
									harvesterCommands[i].onCaptureEnd = function() {
										showToast('You can now train new units on your new hut! But you first need to move your harvester away from the hut on your next turn.', -1, null, true);
										var currP = boc.utils.getCurrentPlayer();
										currP.unitSet = new bbq.UnitSet(currP.team, ['Harvester']);
										boc.utils.waitForClick(function () {
											canEndTurn = true;
											showToast('End your turn now');				                
											$em(tutArrow).comp('Spatial').angle = boc.utils.degToRad(180);
											$em(tutArrow).comp('Spatial').update({ x: _this.camera.xmax - 155, y: _this.camera.ymin + 70 });
											$em(tutArrow).add(new boc.components.CameraFollow({ camera: _this.camera }));
										});
									};
								}
							} // for i
						}) ; // showToast                      
					});
				});
			
			});
        }; // turn2cb

        boc.utils.waitForClick(function () {
            boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'endTurn', args: { tutorialCallback: turn2cb} }), em);            
        });
        
        hud.on('open', function() {
        	hud.closeTrainWindow();	
        	boc.utils.createEvent(
                new bbq.events.MapSelectEvent({
                    action: 'unlockCursor',
                    args: {}
                }),
                em
            );
        });
        
        var canEndTurn = false;
        hud.on('endturn', function() {
        	if (canEndTurn) {
        		$em(tutArrow).comp('DrawableSprite').visible = false;
        		$em(tutArrow).remove('CameraFollow');
        		userP = boc.utils.getCurrentPlayer();
        		boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'endTurn', args: { tutorialCallback : turn3 } }), em);
        	} 
        });
    }; // turn2
    
    var showAndUnlockCursor = function() {
    	boc.utils.createEvent(
	        new bbq.events.MapSelectEvent({
	            action: 'showCursor',
	            args: {}
	        }),
	        em
	    );
	    boc.utils.createEvent(
	        new bbq.events.MapSelectEvent({
	            action: 'unlockCursor',
	            args: {}
	        }),
	        em
	    );    	
    };
    
    var hideAndLockCursor = function() {
    	boc.utils.createEvent(
            new bbq.events.MapSelectEvent({
                action: 'hideCursor'                    
            }),
            em
        );    
        boc.utils.createEvent(
            new bbq.events.MapSelectEvent({
                action: 'lockCursor'                    
            }),
            em
        );
    };
    
    var showToast = function(msg, delay, callback, more) {
		if (delay) {
	    	boc.utils.createEvent(new boc.components.DelayedMethod(function() {
	            if (toastWindow) {
					toastWindow.remove();
				}
				
				toastWindow = bbq.frontend.toast(msg, { delay: -1, more: more});
        		if (callback) {
        			callback();
        		}
	        }, delay), em, { duration: delay + 1000 });	
    	}
    	else {
			if (toastWindow) {
	    		toastWindow.remove();
			}
        	toastWindow = bbq.frontend.toast(msg, { delay: -1, more: more });
        	if (callback) {
    			callback();
    		}
    	}
	} // showToast
    
    var pointTo = function(x, y, angle) {    	
        var x = _this._mapObj.tileWidth() * x + 45,
    		y = _this._mapObj.tileHeight() * y - 50;
    	$em(tutArrow).comp('Spatial').angle = angle ? boc.utils.degToRad(angle) : 0;
    	$em(tutArrow).comp('Spatial').update({x : x, y : y});            
    }; // pointTo
    
    var movePointerTo = function(x, y, duration) {
    	boc.utils.createEvent(new boc.components.DelayedMethod(function() {
	        x = _this._mapObj.tileWidth() * x + 45;
	    	y = _this._mapObj.tileHeight() * y - 50;
	    	
	    	var ts = $em(tutArrow).comp('Spatial');
	    	
	    	var anim = new boc.components.Animation({
	            componentName: 'Spatial',
	            propertyDeltas: { x: x - ts.x, y : y - ts.y },
	            easing: 'linearTween',
	            duration: duration ? duration : 2000,
	            state: boc.constants.ANIMATION_PLAYING
	        });                
	        $em(tutArrow).remove('Animation');
	        $em(tutArrow).add(anim);
        }, 1000), em, { duration: 2000 });    	
    }; // movePointerTo
    
    var userP = null;
    var turn3 = function() {
    	turn = 3;
    	hud.removeListener('endturn');
    	hud.removeListener('trainback');
    	hud.removeListener('open');
    	hideAndLockCursor();    	
        
    	var cpuP = boc.utils.getCurrentPlayer();
    	
    	toastWindow.remove();
        showToast('Looks like the enemy wants some blood!', -1, null, true);
        boc.utils.centerCamera(_this.camera, cpuP.units[0]);
    
    	var okToAttack = false;    
        var onAttackEnd = function() {        	
	        toastWindow.remove();
	        if (!okToAttack) { // retaliate
	        	okToAttack = true;
	        	toastWindow = bbq.frontend.toast('Your turn! Finish it!', { delay: -1 });
	        	$em(tutArrow).comp('Spatial').angle = 0;	        	
	        	$em(tutArrow).comp('Spatial').update({x:345, y:200});
	        	$em(tutArrow).comp('DrawableSprite').visible = true;
	            boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'endTurn', args: { tutorialCallback: attackEnemy } }), em);
	        }             			
	        else if (turn === 3) { // attack	
	        	showAndUnlockCursor();
	            moveHarvesterToTree();
	            turn3Complete = true;
	        } // else attack
        };
                
        boc.utils.waitForClick(function () {
        	var srcEnt = cpuP.units[0];
        	var dstEnt = userP.units[1];
        	var srcDmg = $em(srcEnt).comp('Attack').damage;
        	var dstDmg = Math.floor($em(srcEnt).comp('Attack').damage / 2);
            boc.utils.createEvent(new bbq.events.CommandEvent({
                action: 'attackEntity',
                args: {
                    src: srcEnt,
                    dst: dstEnt,
                    damage: srcDmg,
                    onAttackEnd: function() {
        				showToast('Ouch! At least your Scout survived.', -1, null, true);
        				boc.utils.waitForClick(function () {
    						showToast('Your unit will retaliate if it\'s within attack range at half the damage.', -1, null, true);
    						boc.utils.waitForClick(function () {
    							boc.utils.createEvent(new bbq.events.CommandEvent({
					                action: 'attackEntity',
					                args: {
					                    src: dstEnt,
					                    dst: srcEnt,
					                    damage: dstDmg,
					                    onAttackEnd: onAttackEnd
					                }
					            }), $em());
    						});    						    						    						           
				        });
                    }
                }
            }), $em());
            
        });
        
        var attackEnemy = function() {
        	showAndUnlockCursor();            
            var harvester = userP.units[0];
            $em(harvester).comp('Unit').state = 'inactive';
            
            var scout = userP.units[1];
            var scoutCommands = $em(scout).comp('Commandable').commands;
            for (var i = 0; i < scoutCommands.length; i++) {
            	if (scoutCommands[i].name() !== 'Attack') {
            		scoutCommands[i].disabled(true);
            	}
            }   
            
            // disable all train
            for (i = 0; i < userP.buildings.length; i++) {
            	var cmds = $em(userP.buildings[i]).comp('Commandable').commands;
            	for (var j = 0; j < cmds.length; j++) {
            		cmds[j].disabled(true);
            	}
            }         
        }; // attackEnemy
        
        var harvesterMovedToTree = false;
        var moveHarvesterToTree = function() {
        	boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: userP.units[1] } }), em);	            
            $em(tutArrow).comp('Spatial').update({x:95, y:0});
            var anim = new boc.components.Animation({
                componentName: 'Spatial',
                propertyDeltas: { x: 200 },
                easing: 'linearTween',
                duration: 2000,
                state: boc.constants.ANIMATION_STOPPED
            });                
            $em(tutArrow).remove('Animation');
            $em(tutArrow).add(anim);
            boc.utils.createEvent(new boc.components.DelayedMethod(function() {
                anim.state = boc.constants.ANIMATION_PLAYING;
            }, 1000), em, { duration: 2000 });	        		        	      
            toastWindow = bbq.frontend.toast('Good job! Move your Harvester to the tree', { delay: -1 });
            var harvester = userP.units[0];
            var harvesterCommands = $em(harvester).comp('Commandable').commands;
            $em(harvester).comp('Unit').state = 'idle';
            for (var i = 0; i < harvesterCommands.length; i++) {
            	if (harvesterCommands[i].name() === 'Move') {
            		harvesterCommands[i].disabled(false);
            		harvesterCommands[i].moveTiles = ['5,1'];
            		harvesterCommands[i].onMoveEnd = function() {                			
            			for (var k = 0; k < harvesterCommands.length; k++) {
            				if (harvesterCommands[k].name() === 'Hold') {
            					harvesterCommands[k].disabled(false);
            					harvesterCommands[k].onHoldEnd = function() {
            						trainLowerHut();
            					};
            				}
            			}
            			toastWindow.remove();
            			toastWindow = bbq.frontend.toast('Your unit gains 1 vision when it\'s on a tree. Click Wait.', { delay: -1 });
            			harvesterMovedToTree = true;
            		};
            	} else {
            		harvesterCommands[i].disabled(true);
            	}
            }
        };//moveHarvesterToTree 
        
        var lowerHutTrained = false;
        var trainLowerHut = function() {
        	var lowerHutCommands = $em(userP.buildings[1]).comp('Commandable').commands;
        	for (var k = 0; k < lowerHutCommands.length; k++) {
        		lowerHutCommands[k].disabled(false);
        	}
        	pointToLowerHut();
        	toastWindow.remove();
        	toastWindow = bbq.frontend.toast('Train another Harvester.', { delay: -1 });
        }; // trainLowerHut
        
        var upperHutTrained = false;
        var trainUpperHut = function() {        	
    		toastWindow.remove();
    		toastWindow = bbq.frontend.toast('Now train an Axe Thrower.', { delay: -1 });
    		var upperHutCommands = $em(userP.buildings[2]).comp('Commandable').commands;
        	for (var k = 0; k < upperHutCommands.length; k++) {
        		upperHutCommands[k].disabled(false);
        	}
        	userP.unitSet = new bbq.UnitSet(userP.team, ['DartBlower']);
        	pointToUpperHut();
        }; // trainUpperHut
        
        hud.on('trainback', function() {
        	if (!lowerHutTrained) {
        		if (userP.units.length < 3) {
        			showToast('Train another Harvester.');
        		}
        		else {
        			lowerHutTrained = true;
        			trainUpperHut();
        		}
        	}
        	        	
        	if (lowerHutTrained && !upperHutTrained) {
        		if (userP.units.length < 4) {
        			showToast('Train an Axe Thrower.')
        		} else {
	        		upperHutTrained = true;
	        		showToast('Axe throwers can attack from afar; keep that in mind', -1, null, true);
	        		boc.utils.waitForClick(function () {
						showToast('End your turn now'); 
						pointToEndTurn();	
					});
        		}        		
        	}         	
        }); // hud on train back
        
        hud.on('open', function() {
        	if (!harvesterMovedToTree) {
	        	hud.closeTrainWindow();
	        	showAndUnlockCursor();	
        	}
        	else {
        		if (!lowerHutTrained && !upperHutTrained) {
        			//        			        					        			
        		}
        		else if (lowerHutTrained && !upperHutTrained) {
        			//
        		}
        		else if (lowerHutTrained && upperHutTrained) {
        			//
        		}
        	}        	
        }); // hud on open
        
        hud.on('endturn', function() {
        	if (lowerHutTrained && upperHutTrained && userP.units.length === 4) {
        		endTurn(turn4);        		
        	}
        });
    }; // turn3
    
    var turn4 = function() {
    	turn = 4;
    	clearHudEvents();
    	$em(tutArrow).comp('DrawableSprite').visible = false;
    	showToast('Calculating computer moves...');
    	showToast('Move your harvester to the berries', 1000, function() {
    		endTurn(moveBottomHarvester);
    	});
    	    	
    	// 1) 
    	var moveBottomHarvester = function() {
    		// setup code for this turn
	    	// ---------------------------
	    	
	    	// disable train on all buildings
	    	for (var b = 0; b < userP.buildings.length; b++) {
	    		var bc = $em(userP.buildings[b]).comp('Commandable').commands;
	    		for (var c = 0; c < bc.length; c++) {
	    			bc[c].disabled(true);
	    		}
	    	} // for b
	    	
	    	// lower harvester first: only gather and move
	    	var hc = $em(userP.units[2]).comp('Commandable').commands;
	    	for (var c = 0; c < hc.length; c++) {
	    		if (hc[c].name() === 'Gather') {
	    			hc[c].onGatherEnd = function() {
	    				showToast('At the start of the next turn you\'ll gain some food!', -1, null, true);
	    				boc.utils.waitForClick(function () {
							showToast('Move your other Harvester')
							moveTopHarvester();
						});
					};
					continue;
				}
				else if (hc[c].name() === 'Move') {
					hc[c].moveTiles = ['0,5'];
					hc[c].onMoveEnd = function() {
						showToast('Choose Harvest');
					}
				}			
				else {
					hc[c].disabled(true);
				}
	    	}
	    	
	    	// all other units: disable everything for now
	    	for (var u = 0; u < userP.units.length; u++) {
	    		if (u === 2) { 
	    			continue; 
				}
		    	hc = $em(userP.units[u]).comp('Commandable').commands;
		    	for (c = 0; c < hc.length; c++) {
		    		hc[c].disabled(true);			
		    	}	
	    	}
			
	    	$em(tutArrow).remove('CameraFollow');
    		$em(tutArrow).comp('DrawableSprite').visible = true;
    		pointTo(1, 5);
    		movePointerTo(0, 5, 500);
    	}; // moveBottomHarvester
    	
    	// 2)
    	var moveTopHarvester = function() {
    		//debugger;
    		var hc = $em(userP.units[0]).comp('Commandable').commands;
    		var holdCommand = null;
	    	for (var c = 0; c < hc.length; c++) {
	    		if (hc[c].name() === 'Hold') {	    			
	    			hc[c].onHoldEnd = moveDartBlower;
	    			holdCommand = hc[c];	
				}
				else if (hc[c].name() === 'Move') {
					hc[c].moveTiles = ['6,1'];
					hc[c].onMoveEnd = function() {
						holdCommand.disabled(false);
						showToast('Notice your unit couldn\'t move past the water', -1, null, true);
			    	    boc.utils.waitForClick(function () {
							showToast('Water will impede movement. Hit Wait.');
						});
					}
					hc[c].disabled(false);
				}			
				else {
					hc[c].disabled(true);
				}
	    	}
    		pointTo(5, 1);
    		movePointerTo(6, 1, 500);
    	}; // moveTopHarvester
    	
    	var moveDartBlower = function() {
    		showToast('Move your Axe Thrower by the tree');
    		pointTo(1, 1);
    		movePointerTo(4, 1, 500);    		
    		var hc = $em(userP.units[3]).comp('Commandable').commands;
    		var holdCommand = null;
	    	for (var c = 0; c < hc.length; c++) {	    		
				hc[c].disabled(false);			
				if (hc[c].name() === 'Move') {
					hc[c].moveTiles = ['4,1'];
					hc[c].onMoveEnd = function() {
						$em(tutArrow).comp('DrawableSprite').visible = false;
						showToast('Enemy within range! Attack!');
					};
					hc[c].disabled(false);
				}
				else if (hc[c].name() === 'Attack') {
					hc[c].disabled(false);
					hc[c].onAttackEnd = function() {
						pointToEndTurn();
						showToast('Time to finish this! Hit End Turn');
					};
				}
				else {
					hc[c].disabled(true);					
				}	
	    	}
    	}; // moveDartBlower
    	
    	hud.on('endturn', function() {
    		$em(tutArrow).comp('DrawableSprite').visible = false;
    		showToast('Calculating moves...')
    		endTurn(function() {    			
    			endTurn(turn5);
    		});    		    		
    	});    	
    }; // turn4
    
    var turn5 = function() {
    	turn = 5;
    	clearHudEvents();
    	
    	showToast('Choose your Harvester and move to the HQ!', 1000, function() {
    		$em(tutArrow).remove('CameraFollow');
    		$em(tutArrow).comp('DrawableSprite').visible = true;    	
    		pointTo(6, 1, 0);
    		movePointerTo(8, 1, 500);
    	});    	
    	
    	// disable train on all buildings
    	for (var b = 0; b < userP.buildings.length; b++) {
    		var bc = $em(userP.buildings[b]).comp('Commandable').commands;
    		for (var c = 0; c < bc.length; c++) {
    			bc[c].disabled(true);
    		}
    	} // for b
    	
    	var hqCaptured = false;
    	var captureHQ = function () {
    	    showToast('In a real match, HQs take 3 turns to capture.', -1, null, true);
    	    boc.utils.waitForClick(function () {
				showToast('That\'s it! You\'ve finished the tutorial!', -1, null, true);
	    	    boc.utils.waitForClick(function () {
					showToast('Hit pause to go back to the main menu.');
					hqCaptured = true;
					pointToPause();
				})
			});
    	};

    	// disable all units except the first harvester    	  
    	for (var u = 0; u < userP.units.length; u++) {
    		if (u === 0) {
    			$em(userP.units[u]).comp('Movement').range = 2;	
    		}
    		
    		var uc = $em(userP.units[u]).comp('Commandable').commands;
    		for (var c = 0; c < uc.length; c++) {
    			if (u === 0) {
    				if (uc[c].name() === 'Move') {
    					uc[c].moveTiles = ['8,1']; 
    					uc[c].onMoveEnd = function() {
    						showToast('Capture their HQ to win!');
    					};
    				}
    				else if (uc[c].name() === 'Capture') {
    					uc[c].onCaptureEnd = captureHQ;
    				}
    				else {
    					uc[c].disabled(true);
    				}
    			} 
    			else {
    				uc[c].disabled(true);
    			} 
    		} // c    		
    	} // u    	    	
    	
    	//hud.on('endturn', function() {
    	//	if (hqCaptured) {
    	//		toastWindow.remove();
    	//		if (options.onTutorialEnd) {
    	//			options.onTutorialEnd();
    	//		}	
    	//	}    		
        //});    	
    }; // turn5

}; // Tutorial


/**
* Adds a system into the game.
* @param {object} system A System object.
*/
bbq.Tutorial.prototype.pause = function () {
    _this._gameEngine.pause();
};

bbq.Tutorial.prototype.back = function () {

};

/**
* Adds a system into the game.
* @param {object} system A System object.
*/
bbq.Tutorial.prototype.stop = function (onStop) {
    this._gameEngine.stop(onStop);    
};