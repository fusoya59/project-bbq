/// <reference path="components.js" />
/// <reference path="game.js" />
/// <reference path="map.js" />
/// <reference path="user.js" />
/// <reference path="session.js" />
/// <reference path="scenes.js" />
/// <reference path="../core/components.js" />
/// <reference path="../core/entitysystem.js" />
/// <reference path="../core/utils.js" />

ns('bbq.frontend');

bbq.frontend._initialFillScreen = false;
bbq.frontend.centerElem = function(elem) {
	console.log("CENTERING");
	var docElem = document.documentElement;
	
	var width = docElem.clientWidth,
		height = docElem.clientHeight;

	var centerTop = (height - elem.height()) / 2,
		centerLeft = (width - elem.width()) / 2;

	var e = document.getElementsByClassName('pauseMenu')[0];
	
	console.log(height, elem.height(), e.offsetHeight, centerTop);

	elem.css('top', centerTop + 'px').css('left', centerLeft + 'px');
}

bbq.frontend.fillScreen = function() {
	var docElem = document.documentElement;
	
	var width = docElem.clientWidth,
		height = docElem.clientHeight;

	var minWidth = 0,
		minHeight = 0;
//	var	maxWidth = 1280,
//		maxHeight = 1000;


	//if (maxWidth && width > maxWidth) { width = maxWidth; }
	//if (maxHeight && height > maxHeight) { height = maxHeight; }
	if (minWidth && width < minWidth) { width = minWidth; }
	if (minHeight && height < minHeight) { height = minHeight; }

	bbq.frontend.width = width;
	bbq.frontend.height = height;

	var sceneContainer = $('.sceneContainer')[0];

	/*	
	if (director && director.currentScene() && 
		director.currentScene().attr('id') !== 'scene_1' && director.currentScene().attr('id') !== 'scene_0') {
		if (bbq.frontend._initialFillScreen && sceneContainer) {
			sceneContainer.style.width = width + '.px';
			sceneContainer.style.height = height + '.px';
		}
	}
	*/
	
	bbq.frontend._initialFillScreen = true;
	var canvas = $('canvas')[0];
	if (canvas) {
		canvas.style.width = "";
		canvas.style.height = "";

		canvas.width = width;
		canvas.height = height;
		
		console.log(width, height);
	}
	
	if (SharedSession && SharedSession.gameObj && SharedSession.gameObj.camera) {
	    var camera = SharedSession.gameObj.camera;
	    if (typeof (camera) === 'function') {
	        camera = camera();
	    }
		camera.update({
		    xmax: camera.xmin + width,
		    ymax: camera.ymin + height
		});
	}
	
	var hud = $('.hud')[0];
	if (hud) {
		hud.style.width = width + 'px';
		hud.style.height = height + 'px';
	}
	
	
	var toast = $('.toast')[0];
	if (toast && hud) {
		console.log($(hud).width());
		var toastLeft = (parseInt($(hud).width()) - parseInt($(toast).width())) / 2;
		var toastBottom = 150;

		toast.style.left = toastLeft.toString() + '.px';
		toast.style.top = '';
		toast.style.bottom = toastBottom.toString() + '.px';
		console.log('toast.style.bottom', toast.style.bottom);
	}
	
	$('.autoadjust').each(function() {
		var $this = $(this);		
		var centerTop = (height - $this.height()) / 2,
			centerLeft = (width - $this.width()) / 2;
		$this.css('top', centerTop + 'px').css('left', centerLeft + 'px');
	});
	
	$('.autofill').each(function() {
		$(this).width(width).height(height);
	});
}

//window.onresize = bbq.frontend.fillScreen;
window.addEventListener('resize', bbq.frontend.fillScreen, false);
	
bbq.frontend.fadeblackHtml = '<div class="fadeBlack hidden autofill" style="display: block;"></div>';
bbq.frontend.showYesNo = function (title, msg, yes, no) {
    var $yesNoDiv = $('<div>');
    var $fade = $(bbq.frontend.fadeblackHtml);
    $fade.width(document.documentElement.clientWidth).height(document.documentElement.clientHeight).css('z-index', '1500');
    
    $(document.body).append($fade);

    var $yesNoDiv = $('<div style="position:absolute;top:0px;left:0px;z-index:2000">');
    var id = 'yesNoWindow';
    var $yesNo = $(bbq.UiCache['ui/yesNoWindow.html']);
        
    $yesNo.hide();
    $yesNoDiv.attr('id', id)
             .append($yesNo);
    $(document.body).append($yesNoDiv);
	
    var centerLeft = (document.documentElement.clientWidth - $yesNo.width()) / 2,
    	centerTop = (document.documentElement.clientHeight - $yesNo.height()) / 2;
    
    $yesNo.css('left', centerLeft + 'px').css('top', centerTop + 'px');
    $yesNo.addClass('autoadjust');
    
    $yesNo.slideDown(200);    

    var yesNoWindow = new bbq.scenes.HtmlYesNoWindow(title, msg, id);
    var remove = function () {
        $fade.remove();
        $yesNoDiv.remove();
    };
    yesNoWindow.on('yes', function () {
        bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
        remove();
        if (yes) { yes(); }
    });
    yesNoWindow.on('no', function () {
        bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
        remove();
        if (no) { no(); }
    });
        
    
};

bbq.frontend.hideEndTurn = function () {
	$('.btnEndTurn').hide();
}


bbq.frontend.showEndTurn = function () {
	$('.btnEndTurn').show();
}

bbq.frontend.toast = function (msg, options) {
    if (!options) {
        options = {};
    }
    var delay = options.delay || 2000; // ms
    var $attach = options.id ? $('#' + options.id) : $(document.body);

    var $div = $('<div class="toast boxShadowLarge">' + msg + '</div>');
	$div.parent('.hud');

	if (options.more) {
		//alert();
		var $more = $('<span></span>');
		$more
			.css('position', 'absolute')
			.css('bottom', '0px')
			.css('right', '5px')
			.css('font-family', 'MolotRegular')
			.html('More>>')
			.appendTo($div);
	}
	
    if (typeof (options.fade) == 'undefined') {
        options.fade = true;
    }
    if (options.fade) {
        $div.fadeIn(200);
    }
    $attach.append($div);

    if (!options.position) {
        options.position = 'bottom-center';
    }

    var left, top, bottom;
    if (options.position == 'center') {
        left = options.left || ($attach.width() / 2 - $div.width() / 2);
        top = options.top || ($attach.height() / 2 - $div.height() / 2);        
    } else {
        left = options.left || ($attach.width() / 2 - $div.width() / 2);
        //top = options.bottom || $attach.height() - 150; //($div.height() * 2);
        bottom = options.bottom || 150;
    }

    if (typeof (top) == 'number' && typeof (left) == 'number') {
        $div.css('top', top + 'px').css('left', left + 'px');
    }
    else if (typeof (bottom) == 'number' && typeof (left) == 'number') {
        $div.css('bottom', bottom + 'px').css('left', left + 'px');
    }
    

    if (delay != -1) {
        setTimeout(function () {
            if (options.fade) {
                $div.fadeOut(200, function () {
                    $div.remove()
                });
            } else {
                $div.remove();
            }
        }, delay);
    }
    return $div;
};

bbq.frontend.toggleSound = function (state) {
    if (state === 'on') {
        bbq.sh().allOn();
    }
    else {
        bbq.sh().allOff();
    }
};

bbq.frontend.setupScenes = function (id) {   
    var uiLoaded = function () {
        director.setContainer($('#' + id)[0]);
        director.push(uiCache['ui/mainMenu3.html']);
        var mainMenuId = director.currentScene().attr('id')
        var mainMenuScene = new bbq.scenes.HtmlMainMenu(mainMenuId);

        // signIn -> successful -> enable buttons
        //              failure -> alert
        mainMenuScene.on('signIn', function () {
            bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
            var token = encryptedString(boc.utils.API_KEY, ($('input[name="username"]').val() + '+' + $('input[name="password"]').val() + '+' + (+new Date)));
            boc.utils.getJson('login/' + token, {}, function (json) {
                if (json.status == 'ok') {
                    SharedSession.sessionKey = json.result.boc_session;
                    boc.utils.getJson('userinfo', {}, function (json) {
                        if (json.status == 'ok') {
                            SharedSession.user = new bbq.User(json.result);
                            //$('.disabled').removeClass('disabled');
                            //$('a').removeAttr('disabled');
                            $('.signIn').hide();
							$('#mainMenuButtons').show();
                        } // statusok 
                        else {
                            alert(json.result);
                        } // statserror
                    }); // getJson

                } else {
                    alert(json.result);
                }
            });
        });

        var onMenuSoundChange = function (e) {
            if (e.name === 'sound') {
                mainMenuScene.soundState(e.newValue);
                bbq.frontend.toggleSound(e.newValue);
            }
        };

        SharedSession.on('settingsChanged', onMenuSoundChange);
        mainMenuScene.soundState(SharedSession.settings('sound'));
        mainMenuScene.on('sound', function () {
            bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
            var soundState = SharedSession.settings('sound');
            SharedSession.settings('sound', soundState === 'on' ? 'off' : 'on');
        });

        mainMenuScene.on('credits', function () {
            bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
            director.push(uiCache['ui/credits.html'], function (scene) {
                var creditsScene = new bbq.scenes.HtmlCredits(scene.attr('id'));
                var onCreditsSoundChange = function (e) {
                    if (e.name === 'sound') {
                        creditsScene.soundState(e.newValue);
                        bbq.frontend.toggleSound(e.newValue);
                    }
                };

                SharedSession.on('settingsChanged', onCreditsSoundChange);
                creditsScene.soundState(SharedSession.settings('sound'));
                creditsScene.on('sound', function () {
                    bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                    var soundState = SharedSession.settings('sound');
                    SharedSession.settings('sound', soundState === 'on' ? 'off' : 'on');
                });

                creditsScene.on('back', function () {
                    bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                    SharedSession.removeListener('settingsChanged', onCreditsSoundChange);
                    director.pop();
                });                
            });
        });

        // battles -> load footer -> back -> mainMenu
        //                        -> match -> matchMake -> refresh
        //                        -> replayPanel -> replay
        //                        -> battlePanel -> game
        //                        -> challengeAccept -> refresh
        //                        -> challengeDecline -> refresh
        //                        -> footer -> purchaseBadges -> purchase window?
        //                        -> footer -> purchaseTokens -> purchase window?
        //                        -> footer -> purchaseExp -> purchase window?
        var battleMenuScene = null;

        var setupHud = function (scene, tutorialSetup) {
            var hud = new bbq.hud.HtmlHud(scene.attr('id'));
            var $fade = $(bbq.frontend.fadeblackHtml);
            //$fade.width(document.documentElement.clientWidth).height(document.documentElement.clientHeight);
            hud.on('pause', function () {
                bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                $fade.width(document.documentElement.clientWidth).height(document.documentElement.clientHeight);
                $(document.body).append($fade);
                hud.openMenuWindow();
            });
            hud.on('menuresume', function () {
                bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                $fade.remove();
                hud.closeMenuWindow();
            });
            var onHudSoundChange = function (e) {
                if (e.name === 'sound') {
                    hud.soundState(e.newValue);
                    bbq.frontend.toggleSound(e.newValue);
                }
            };

            SharedSession.on('settingsChanged', onHudSoundChange);
            hud.soundState(SharedSession.settings('sound'));
            hud.on('sound', function () {
                bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                var soundState = SharedSession.settings('sound');
                SharedSession.settings('sound', soundState === 'on' ? 'off' : 'on');
            });

            if (!tutorialSetup) {
                hud.on('menubattles', function () {
                    bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                    SharedSession.removeListener('settingsChanged', onHudSoundChange);
                    var music = bbq.sh().getAudio('music/forest');
                    
                    bbq.sh().fadeOut(music, 3000, function () {
                        bbq.sh().reset(music);
                        var menuMusic = bbq.sh().getAudio('music/menu');
                        if (menuMusic) {
                            menuMusic.volume = 0;
                            bbq.sh().play(menuMusic, true);
                            bbq.sh().fadeIn(menuMusic, 1000);
                        }                        
                    });

                    //$('#sceneContainer').width(960).height(640);
                    if (SharedSession.turnClient) {
                        SharedSession.turnClient.disconnect();
                    }
                    SharedSession.gameObj.stop(function () {
                        //battleMenuScene.refresh();
                        //SharedSession.user.currentGame = null;
                        //director.pop();
                        hud.closeMenuWindow();
                        $fade.remove();
                        $('.toast').remove();
                        bbq.frontend.refreshMatches(function () {
                            pendingMatches = SharedSession.user.pendingMatches.length;
                            battleMenuScene.refresh(SharedSession.user);
                            SharedSession.user.currentGame = null;
                            director.pop();
                        });
                    });
                });
                hud.on('menuforfeit', function () {
                    bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                    bbq.frontend.showYesNo('Forfeit', 'Really forfeit?', function () {
                        SharedSession.gameObj.end(0, function (winner) {
                            SharedSession.gameObj.collect(function (reward) {
                                $fade.remove();
                                hud.closeMenuWindow();
                                SharedSession.gameObj.clearFog();
                                bbq.frontend.toast('You lose!', { id: 'sceneContainer' });
                                bbq.sh().play(bbq.sh().getAudio('effects/defeat'));
                                var userPlayer = SharedSession.gameObj.getPlayer(SharedSession.user.playerid);
                                var totalReward = reward.turnTokens + reward.foodTokens + reward.buildingTokens + reward.winBonus.tokens + reward.itemBonus.tokens;
                                hud.summary(userPlayer.summary, userPlayer.turn, SharedSession.gameObj.map().avgTurnsToWin(), totalReward);
                                hud.openSummaryWindow('You Lose!');
                            });
                        });
                    });
                });
                hud.on('summarycollect', function () {
                    bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                    $('#sceneContainer').width(document.documentElement.clientWidth).height(document.documentElement.clientHeight);
                    SharedSession.refreshUser(function (userObj) {
                        battleMenuScene.user(userObj);
                        bbq.frontend.refreshMatches(function () {
                            pendingMatches = userObj.pendingMatches.length;
                            battleMenuScene.refresh();
                            if (SharedSession.turnClient) {
                                SharedSession.turnClient.disconnect();
                            }
                            SharedSession.gameObj.stop(function () {
                                $('.toast').remove();
                                var music = bbq.sh().getAudio('music/forest');
                                bbq.sh().fadeOut(music, 3000, function () {
                                    bbq.sh().reset(music);
                                    var menuMusic = bbq.sh().getAudio('music/menu');
                                    if (menuMusic) {
                                        menuMusic.volume = 0;
                                        bbq.sh().play(menuMusic, true);
                                        bbq.sh().fadeIn(menuMusic, 1000);
                                    }                                    
                                });
                                bbq.frontend.refreshMatches(function () {
                                    pendingMatches = SharedSession.user.pendingMatches.length;
                                    battleMenuScene.refresh(SharedSession.user);
                                    SharedSession.user.currentGame = null;
                                    director.pop();
                                });
                            }); // stop
                        });
                    });
                }); // onSummaryCollect

                hud.on('endturn', function () {
                    bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                    if (SharedSession.gameObj.getCurrentPlayer().id == SharedSession.user.playerid) {
                        bbq.frontend.showYesNo('End turn', 'End your turn now?', function () {
                            SharedSession.gameObj.endTurn(function () {
                                bbq.frontend.toast('Waiting for your turn', { id: 'sceneContainer', delay: -1 });
                                bbq.frontend.hideEndTurn();
                                if (SharedSession.turnClient) {
                                    SharedSession.turnClient.wait(SharedSession.gameObj.id());
                                }
                            });
                        });
                    } // show only if it's the user's turn
                });
            } // no tutorial
            else { // tutorial
                hud.on('menubattles', function () {
                    bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                    SharedSession.removeListener('settingsChanged', onHudSoundChange);
                    SharedSession.gameObj.stop(function () {
                        var music = bbq.sh().getAudio('music/forest');
                        bbq.sh().fadeOut(music, 3000, function () {
                            bbq.sh().reset(music);                            
                            var menuMusic = bbq.sh().getAudio('music/menu');
                            if (menuMusic) {
                                menuMusic.volume = 0;
                                bbq.sh().play(menuMusic, true);
                                bbq.sh().fadeIn(menuMusic, 1000);
                            }                            
                        });
                        hud.closeMenuWindow();
                        $fade.remove();
                        $('.toast').remove();                        
                        SharedSession.user.currentGame = null;
                        director.pop();                        
                    });
                });
            } // if tutorial
            

            hud.on('updateStats', function (p) {
                var info = p.unitInfo;
                hud.showUnitStats();
                console.log(hud);
                hud.name(info.displayName);
                hud.attack(info.attackDamage);
                hud.health(info.health);
                hud.range(info.attackMinRange + '-' + info.attackMaxRange);
                hud.movement(info.moveRange);
                hud.vision(info.visionRange);
                console.log(info);
            });
            return hud;
        }; // setupHud

        mainMenuScene.on('battles',
            function (p) {
                bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                if (p && p.element && $(p.element).attr('disabled')) {
                    return;
                }            
                director.push(uiCache['ui/battleMenu3.html'],
                    function (scene) {
                        var battleMenuId = scene.attr('id');
                        battleMenuScene = new bbq.scenes.HtmlBattleMenu(SharedSession.user, battleMenuId);
                        var footer = battleMenuScene.footer(uiCache['ui/footer.html']);
                        var onFooterSoundSettingChange = function (e) {
                            if (e.name === 'sound') {
                                footer.soundState(e.newValue);
                                bbq.frontend.toggleSound(e.newValue);
                            }
                        };
                        SharedSession.on('settingsChanged', onFooterSoundSettingChange);
                        footer.on('sound', function (state) {
                            var soundState = SharedSession.settings('sound');
                            SharedSession.settings('sound', soundState === 'on' ? 'off' : 'on');
                        });
                        footer.soundState(SharedSession.settings('sound'));
                        battleMenuScene.on('back', function () {
                            bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                            SharedSession.removeListener('settingsChanged', onFooterSoundSettingChange);
                            director.pop(function () {
                                mainMenuScene.clearSignIn();
                            });
                        });
                        var pendingMatches = 1;
                        battleMenuScene.on('match', function () {                            
                            //debugger;
                            bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
							if (pendingMatches == 0) {
                                boc.utils.getJson('matchmake', {}, function (data) {
                                    if (data.status == 'ok') {
                                        bbq.frontend.refreshMatches(function () {
                                            pendingMatches = SharedSession.user.pendingMatches.length;
                                            battleMenuScene.refresh(SharedSession.user);
                                        });
                                    }
                                });
                            }
                        });

                        battleMenuScene.on('refresh', function () {
                            bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                            if (SharedSession && SharedSession.user) {
                                SharedSession.refreshUser(function (userObj) {
                                    battleMenuScene.user(userObj);
                                    bbq.frontend.refreshMatches(function () {
                                        pendingMatches = userObj.pendingMatches.length;
                                        battleMenuScene.refresh();
                                    });
                                });
                            }
                        });
                        battleMenuScene.on('challengeDecline', function () {
                        });
                        battleMenuScene.on('challengeAccept', function () {
                        });
                        battleMenuScene.on('replayPanel', function () {
                        });
						
                        // check the game
                        // if it's player's turn and it's only turn 1 -> goto tribe select
                        // else -> goto hud                        
                        battleMenuScene.on('battlePanel', function (p) {
                            bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                            var gameid = $(p.element).attr('gameid');
                            SharedSession.user.currentGame = gameid;

                            var showHud = function (gameState, replace, collect) {
                                var directorCallback = function (scene) {                                    
                                    var hud = setupHud(scene, false);
                                    bbq.frontend.gameLoadScripts(
                                        gameState,
                                        hud,
                                        function () {
                                        }
                                    );                                    
                                }; // directorCallback
                                if (!replace) {
                                    director.push(uiCache['ui/hud.html'],
                                        null,
                                        directorCallback
                                    ); //push
                                } else {
                                    director.replace(uiCache['ui/hud.html'], directorCallback);
                                }                                
                            }; // showHud

                            boc.utils.getJson(
                               'get/games',
                                {
                                    gameid: gameid
                                },
                                function (data) {									
                                    if (data && data.status == 'ok') {
                                        var json = data.result[0];
                                        var gameState = json;

										if (gameState.winner) {
											showHud(gameState, false, true);
										}
                                        // choose your tribe members!!
                                        else if (gameState.turn == SharedSession.user.playerid && gameState.state[SharedSession.user.playerid].turn == 1) {
                                            director.push(uiCache['ui/tribeMemberSelect3.html'],
                                                function (scene) {
                                                    var tribeSelectScene = new bbq.scenes.HtmlTribeMemberSelect(SharedSession.user, $(scene).attr('id'));
                                                    var tribeFooter = tribeSelectScene.footer(uiCache['ui/footer.html']);
                                                    var onTribeFooterSoundSettingChange = function (e) {
                                                        if (e.name === 'sound') {
                                                            tribeFooter.soundState(e.newValue);
                                                            bbq.frontend.toggleSound(e.newValue);
                                                        }
                                                    };
                                                    SharedSession.on('settingsChanged', onTribeFooterSoundSettingChange);
                                                    tribeFooter.soundState(SharedSession.settings('sound'));
                                                    tribeFooter.on('sound', function (state) {
                                                        bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                                                        var soundState = SharedSession.settings('sound');
                                                        SharedSession.settings('sound', soundState === 'on' ? 'off' : 'on');
                                                    });
                                                    tribeSelectScene.on('back', function () {
                                                        bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                                                        SharedSession.removeListener('settingsChanged', onTribeFooterSoundSettingChange);
                                                        bbq.frontend.refreshMatches(function () {
                                                            pendingMatches = SharedSession.user.pendingMatches.length;
                                                            battleMenuScene.refresh(SharedSession.user);
                                                            SharedSession.user.currentGame = null;
                                                            footer.soundState(SharedSession.settings.sound);
                                                            director.pop();
                                                        });
                                                        //battleMenuScene.refresh();
                                                        //SharedSession.user.currentGame = null;
                                                        //director.pop();
                                                    });
                                                    tribeSelectScene.on('done', function (arg) {
                                                        bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                                                        if (arg) {
                                                            var selected = arg.selected;
                                                            bbq.frontend.showYesNo('Confirmation', 'Choose ' + selected + '?', function () {
                                                                gameState.state[SharedSession.user.playerid].unitSet = tribeSelectScene.loadout() ? bbq.units.configuration.baseLoadout.concat(tribeSelectScene.loadout()) : bbq.units.configuration.baseLoadout.slice(0);;
                                                                showHud(gameState, true);
                                                            });
                                                        }
                                                        else {
                                                            bbq.frontend.showYesNo('Confirmation', 'You\'ve not chosen a special unit. Proceed?', function () {
                                                                gameState.state[SharedSession.user.playerid].unitSet = tribeSelectScene.loadout() ? bbq.units.configuration.baseLoadout.concat(tribeSelectScene.loadout()) : bbq.units.configuration.baseLoadout.slice(0);;
                                                                showHud(gameState, true);
                                                            });
                                                        }
                                                    });
                                                    tribeSelectScene.on('unitInfo', function (arg) {
                                                        tribeSelectScene.showUnitInfoWindow(arg.unitType);
                                                    });
                                                    tribeSelectScene.on('unit', function (arg) {
                                                        tribeSelectScene.loadout([arg.unitType]);
                                                    });
                                                    tribeSelectScene.on('unitPurchase', function (arg) {
                                                        bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                                                        bbq.frontend.showYesNo('Confirmation', 'Purchase ' + bbq.units.configuration[arg.unitType].displayName + '?',
                                                            function () {
                                                                boc.utils.getJson('purchaseUnit/' + arg.unitType, {},
                                                                    function (data) {
                                                                        if (data) {
                                                                            if (data.status == 'ok') {
                                                                                SharedSession.refreshUser(function (userObj) {
                                                                                    debugger;
                                                                                    tribeSelectScene.refresh(userObj);
                                                                                    bbq.frontend.toast(data.result, { id: 'sceneContainer' });
                                                                                });
                                                                            } else {
                                                                                bbq.frontend.toast(data.result, { id: 'sceneContainer' });
                                                                            }
                                                                        } else {
                                                                            bbq.frontend.toast('Server error, please try again later', { id: 'sceneContainer' });
                                                                        }
                                                                    });
                                                                });
                                                            }
                                                    ); // unitPurchase
                                                    tribeSelectScene.on('loadout', function (arg) {
                                                        bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                                                        tribeSelectScene.loadout(null);
                                                    });
                                                }
                                            );
                                        } // choose your tribe member 
                                        else {
                                            showHud(gameState);
                                        }                                        
                                    }
                                } // callback
                            ); // getJson        
                            
                        });
                        footer.on('purchaseBadges', function () {
                            console.log('purchaseBadges');
                        });
                        footer.on('purchaseTokens', function () {
                            console.log('purchaseTokens');
                        });
                        footer.on('purchaseExp', function () {
                            console.log('purchaseExp');
                        });
                        if (SharedSession && SharedSession.user) {                            
                            SharedSession.refreshUser(function (userObj) {
                                battleMenuScene.user(userObj);
                                bbq.frontend.refreshMatches(function () {
                                    pendingMatches = userObj.pendingMatches.length;
                                    battleMenuScene.refresh();
                                });
                            });
                        }
                    } // onLoaded
                );
            } // callback            
        );

        // newAccount -> back -> mainMenu
        //            -> create -> valid info -> valid username -> alert -> mainMenu
        //                                    -> invalid username -> reload CAPTCHA
        //                      -> invalid info -> reload CAPTCHA
        mainMenuScene.on('newAccount', function () {
            bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
            director.push(uiCache['ui/createAccount2.html'], function (scene) {
                var createAccountScene = new bbq.scenes.HtmlCreateAccount(scene.attr('id'));
                createAccountScene.on('back', function () {
                    bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                    director.pop(function () {
                        mainMenuScene.clearSignIn();
                    });
                });
                createAccountScene.on('create', function () {
                    bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
                    if (createAccountScene.validate()) {
                        // do the account creation routine
                        boc.utils.getJson('createuser',
                            {
                                name: $('input[name="displayName"]').val(),
                                email: $('input[name="create_email"]').val(),
                                password: encryptedString(boc.utils.API_KEY, '^$' + $('input[name="create_password"]').val()),
                                recaptcha_challenge_field: Recaptcha.get_challenge(),
                                recaptcha_response_field: Recaptcha.get_response(), 
                                recaptcha_ignore : true // TODO: remove me for non-tizen
                            },
                            function (data) {
                                if (data.status == 'ok') {
                                    alert(data.result);
                                    director.pop(function () {
                                        mainMenuScene.clearSignIn();
                                    });
                                    //director.pop();
                                } else {
                                    //alert(data.result);
                                    //$('.createAccountMessage').show();
                                    //$('.createAccountMessageBg').text(data.result);
                                    createAccountScene.showMessageBox(data.result);
                                    Recaptcha.reload();
                                }
                            } // data
                        ); // getJson
                    }
                });
            });
        });

        // myTribe -> back -> mainMenu
        mainMenuScene.on('myTribe', function (p) {
            if (p && p.element && $(p.element).attr('disabled')) {
                return;
            }
            director.push(uiCache['ui/myTribe.html'], function (scene) {
                var myTribeScene = new bbq.scenes.HtmlMyTribe(SharedSession.user, scene.attr('id'));
                myTribeScene.on('back', function () {
                    director.pop(function () {
                        mainMenuScene.clearSignIn();
                    });
                });
                var footer = myTribeScene.footer(uiCache['ui/footer.html']);
                footer.on('purchaseBadges', function () {
                    console.log('myTribe purchaseBadges');
                });
                footer.on('purchaseTokens', function () {
                    console.log('myTribe purchaseTokens');
                });
                footer.on('purchaseExp', function () {
                    console.log('myTribe purchaseExp');
                });
            });
        });

        // friends -> back -> mainMenu
        mainMenuScene.on('friends', function (p) {
            if (p && p.element && $(p.element).attr('disabled')) {
                return;
            }
            director.push(uiCache['ui/friends.html'], function (scene) {
                var friendScene = new bbq.scenes.HtmlFriends(SharedSession.user, scene.attr('id'));
                friendScene.on('back', function () {
                    director.pop(function () {
                        mainMenuScene.clearSignIn();
                    });
                });
                friendScene.on('add', function () {
                    console.log('add friend!');
                });
                var footer = friendScene.footer(uiCache['ui/footer.html']);
                footer.on('purchaseBadges', function () {
                    console.log('friends purchaseBadges');
                });
                footer.on('purchaseTokens', function () {
                    console.log('friends purchaseTokens');
                });
                footer.on('purchaseExp', function () {
                    console.log('friends purchaseExp');
                });
            });
        });

        mainMenuScene.on('tutorial', function (e) {
            bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
            var gameState = {};
            for (var k in bbq.tutorialGameState) {
                gameState[k] = bbq.tutorialGameState[k];
                if (k === 'state') {
                    gameState.state = {};
                    for (var j in bbq.tutorialGameState[k]) {
                        gameState.state[j] = bbq.tutorialGameState[k][j];
                    }
                }
            }

            var playerState = gameState.state.$playerid;
            delete gameState.state.$playerid;
            gameState.state[SharedSession.user.playerid] = playerState;
            gameState.turn = SharedSession.user.playerid;            
            var directorCallback = function (scene) {
                var hud = setupHud(scene, true);
                debugger;
                bbq.frontend.gameLoadScripts(
                    gameState,
                    hud,
                    function () {
                    },
                    true
                );
            }; // directorCallback
            
            director.push(uiCache['ui/hud.html'],
                null,
                directorCallback
            ); //push            
        }); // on tutorial

        mainMenuScene.on('logout', function (e) {
            bbq.sh().play(bbq.sh().getAudio('effects/buttonClick'));
            $('.signIn').show();
            $('#mainMenuButtons').hide();
            mainMenuScene.clearSignIn();
        });
    }; // uiLoaded

    var uiCache = bbq.UiCache;
    uiCache.loadUi('ui/',
        [
            'credits.html',
            'battleMenu3.html',
            'mainMenu3.html',
            'friends.html',
            'footer.html',
            'myTribe.html',
            'myChieftain.html',
            'createAccount2.html',
            'hud.html',
            'tribeMemberSelect3.html',
            'yesNoWindow.html',
            'unitInfoWindow.html'
        ],
        function () {
            uiLoaded();
        },
        [ 'ui.css', 'ui2.css' ]
    );
};

bbq.frontend.GameHUD = {
    sharedSession: null,
    rootDiv: null,

    // [ {id:'blah',callback:function() { blah; } } ]
    // menuEvents: { onMenuShow: function() {}, onMenuHide : function() }
    init: function (buttonEvents, menuEvents, div) {
        bbq.frontend.GameHUD.rootDiv = div;
        $('#game_btngame_menuShow').click(function () {
            $(this).hide();
            $('#game_menu').show();
            $('.game_battleNavBg').slideDown('fast');
            $('#game_menu .panel').slideDown('fast', function () {
                if (menuEvents && menuEvents.onMenuShow) {
                    menuEvents.onMenuShow();
                }
            });
        });
        $('#game_btngame_menuClose').click(function () {
            $('#game_menu .panel').slideUp('fast', function () {
                $('#game_menu').hide();
                $('#game_btngame_menuShow').show();
            });
            $('.game_battleNavBg').slideUp('fast');
            if (menuEvents && menuEvents.onMenuHide) {
                menuEvents.onMenuHide();
            }
        });
        for (var i = 0; i < buttonEvents.length; i++) {
            $('#' + buttonEvents[i].id).click(buttonEvents[i].callback);
        } // i        			
	},

    YesNoModalWindow: function (message, onYes, onNo) {
        var _this = this;

        var maskDiv = $('<div>').addClass('game_fadeScreen');
        var dialogDiv = $('<div>').addClass('panel game_dialog');
        $(maskDiv).append(dialogDiv);

        var msgDiv = $('<div>').addClass('game_dialogText').text(message);
        var buttonDiv = $('<div>').addClass('game_dialogButtons');
        var yesDiv = $('<div>').addClass('button').css('margin-left', '5px').css('margin-right', '5px').text('Yes').click(function () {
            if (onYes) { onYes(); }
            _this.remove();
        });
        var noDiv = $('<div>').addClass('button').css('margin-left', '5px').css('margin-right', '5px').text('No').click(function () {
            if (onNo) { onNo(); }
            _this.remove();
        });
        $(buttonDiv).append(yesDiv).append(noDiv);
        $(dialogDiv).append(msgDiv).append(buttonDiv);

        this.show = function () {
            $(bbq.frontend.GameHUD.rootDiv).append(maskDiv);
        } // show

        this.remove = function () {
            $(maskDiv).remove();
        } // remove
    }, // YesNoModalWindow

    // options.duration (number, milliseconds)
    // options.onremove (function)
    ToastWindow: function (message, options) {
        if (options && !isNaN(options)) { // it's a number!
            options = { duration: options };
        }
        var _this = this;
        var div = $('<div>').addClass('toast').addClass('boxShadowLarge').text(message).hide();
        
		if (options && options.duration) {
            setTimeout(function () {
                _this.remove(options.onremove);
            }, options.duration);
        }

        $(bbq.frontend.GameHUD.rootDiv).append(div);
        $(div).css('left', (($(bbq.frontend.GameHUD.rootDiv).width() - $(div).width()) / 2) + 'px');

        $(div).fadeIn('fast');

        this.remove = function (onremove) {
            $(div).fadeOut('fast', function () {
                $(this).remove();
                if (onremove) { onremove(); }
            });
        } // remove
    },

    CurrentBattles: {
        // opponentname, description, onclick (function)
        add: function (params) {
            var battlePanelDiv = $('<div>').addClass('game_battlePanel').addClass('button').addClass('scroll');
            var vsAvatar = $('<div>').addClass('game_vsAvatar');
            // TODO: do something with avatar
            var vsName = $('<div>').addClass('game_vsName').text(params.opponent);
            var vsDesc = $('<div>').addClass('game_vsDesc').text(params.description);
            $(battlePanelDiv).append(vsAvatar).append(vsName).append(vsDesc);
            $(battlePanelDiv).click(params.onclick);
            $('.game_battleNav').append(battlePanelDiv);
        },
        clear: function () {
            $('.game_battleNav').empty();
        } // clear
    }, // CurrentBattles

    SummaryWindow: function (winner, playerSummary, scoring) {
        var description = '';
        var _this = this;
        if (winner == SharedSession.user.playerid) {
            description = 'You win!';
        } else {
            description = 'You lose!';
        }

        $('.game_summaryBg_root').show();
        $('.game_summaryBg').slideDown('fast');
        this.onContinueClick = null;

        $('.game_summaryContinue').click(function () {
            $('.game_summaryBg').slideUp('fast', function () {
                $('.game_summaryBg_root').hide();
            });
            if (_this.onContinueClick) { _this.onContinueClick(); }
        }); // clickcontinue

        $('.game_summaryTitle').text(description);

        $('#summary_unitsKilled').text(playerSummary.unitsKilled ? playerSummary.unitsKilled : 0);
        $('#summary_unitsLost').text(playerSummary.unitsLost ? playerSummary.unitsLost : 0);
        $('#summary_unitsTokens').text('+' + scoring.unitTokens);
        $('#summary_foodGathered').text(playerSummary.foodCollected ? playerSummary.foodCollected : 0);
        $('#summary_foodConsumed').text(playerSummary.foodConsumed ? playerSummary.foodConsumed : 0);
        $('#summary_foodTokens').text('+' + scoring.foodTokens);
        $('#summary_buildingsCaptured').text(playerSummary.buildingsCaptured ? playerSummary.buildingsCaptured : 0);
        $('#summary_buildingsLost').text(playerSummary.buildingsLost ? playerSummary.buildingsLost : 0);
        $('#summary_buildingsTokens').text('+' + scoring.buildingTokens);
        $('#summary_turnsTotal').text(playerSummary.turns ? playerSummary.turns : 0);
        $('#summary_turnsTokens').text('+' + scoring.turnTokens);

        // TODO: distinguish base vs. win bonus vs. item bonus
        $('#summary_totalXP').text('+' + (scoring.preBonusTotal.xp + scoring.winBonus.xp + scoring.itemBonus.xp));
        $('#summary_totalTokens').text('+' + (scoring.preBonusTotal.tokens + scoring.winBonus.tokens + scoring.itemBonus.tokens));

    }, // SummaryWindow

    ModalWindow: function (message, id) {

        var _this = this;

        var maskDiv = $('<div>').addClass('game_fadeScreen');
        if (id) { maskDiv.attr('id', id); }
        var dialogDiv = $('<div>').addClass('panel game_dialog');
        $(maskDiv).append(dialogDiv);

        var msgDiv = $('<div>').addClass('game_dialogTextVertical').text(message);

        $(dialogDiv).append(msgDiv);

        this.show = function (root) {
            if (!root) { root = bbq.frontend.GameHUD.rootDiv; }
            $(root).append(maskDiv);
        } // show

        this.remove = function () {
            $(maskDiv).remove();
        } // remove        		    
    }
};

bbq.frontend.waitForTurnToast = null;
bbq.frontend.waitForTurnTid = null;
bbq.frontend.waitForTurnInterval = 5000; // 5 sec

// checks the server every interval to see if it's user's turn
bbq.frontend.waitForTurn = function () {
    if (bbq.frontend.waitForTurnTid) {
        clearTimeout(bbq.frontend.waitForTurnTid);
    }

    // there's a winner!
    if (SharedSession.gameObj.winner()) {
        //new bbq.frontend.GameHUD.ToastWindow('Game over! The winner is ' + SharedSession.gameObj.winner() + '!', 3000);
    }

        // no winner
    else {
        boc.utils.getJson(
            'get/games',
            { gameid: SharedSession.gameObj.id(), _fields: 'turn' },
            function (json) {
                if (json.status == 'ok') {
                    var whoseTurn = json.result[0].turn;
                    if (whoseTurn == SharedSession.user.playerid) {

                        if (bbq.frontend.waitForTurnToast) {
                            bbq.frontend.waitForTurnToast.remove();
                            bbq.frontend.waitForTurnToast = null;
                        }

                        boc.utils.getJson(
                            'get/games',
                            {
                                gameid: SharedSession.gameObj.id()
                            },
                            function (data) {
                                if (data && data.status == 'ok') {
                                    gameState = data.result[0];
                                    SharedSession.gameObj.load(gameState);
                                    new bbq.frontend.GameHUD.ToastWindow('Your turn!', 3000);
									bbq.frontend.showEndTurn();
                                }
                            } // callback
                        ); // getJson            	                    
                    } else {
                        if (!bbq.frontend.waitForTurnToast) {
                            bbq.frontend.waitForTurnToast = new bbq.frontend.GameHUD.ToastWindow("Waiting for " + whoseTurn + "'s turn!");
                        }

                        bbq.frontend.waitForTurnTid = setTimeout(function () {
                            bbq.frontend.waitForTurn();
                        }, bbq.frontend.waitForTurnInterval); // wait for turn every 5 seconds
                    }
                } // ok
            }
        );
    }
} // bbq.frontend.waitForTurn

bbq.frontend.refreshMatches = function (onRefreshComplete) {
    SharedSession.user.pendingMatches = [];
    SharedSession.user.activeMatches = [];
    SharedSession.user.retiredMatches = [];
    SharedSession.user.pendingChallengeRequests = [];
    SharedSession.user.pendingChallengeReplies = [];
    boc.utils.getJson('getmatches', { playerid: SharedSession.user.playerid },
        function (json) {
            if (json.status == 'ok') {
                //debugger;
                for (var i = 0; i < json.result.length; i++) {
                    var status = json.result[i].status;
                    if (status == 'pending') {
                        SharedSession.user.pendingMatches.push(new bbq.Match(json.result[i]));
                    }
                    else if (status == 'active') {
                        SharedSession.user.activeMatches.push(new bbq.Match(json.result[i]));
                    }
                    else if (status == 'retired') {
                        SharedSession.user.retiredMatches.push(new bbq.Match(json.result[i]));
                    }
                    else if (status == 'challenging') {
                        SharedSession.user.pendingChallengeRequests.push(new bbq.Match(json.result[i]));
                    }
                    else if (status == 'challenged') {
                        SharedSession.user.pendingChallengeReplies.push(new bbq.Match(json.result[i]));
                    }
                } // for i

                //debugger;
                // let's sort by lastupdate
                SharedSession.user.pendingMatches.sort(function (a, b) { return b.lastupdate - a.lastupdate; });
                SharedSession.user.activeMatches.sort(function (a, b) { return b.lastupdate - a.lastupdate; });
                SharedSession.user.retiredMatches.sort(function (a, b) { return b.lastupdate - a.lastupdate; });
                SharedSession.user.pendingChallengeRequests.sort(function (a, b) { return b.lastupdate - a.lastupdate; });
                SharedSession.user.pendingChallengeReplies.sort(function (a, b) { return b.lastupdate - a.lastupdate; });
            }
            if (onRefreshComplete) { onRefreshComplete(); }
        } // callback
    ); // getjson
} // bbq.frontend.refreshMatches

// TODO: move the next 4 functions to game object
bbq.frontend.handleSurrender = function () {
    SharedSession.gameObj.end('0', function (winner) {
        bbq.frontend.handleCollect(winner);
    }); // end					
} // handleSurrender

bbq.frontend.handleUserWin = function() {
    SharedSession.gameObj.end('1', function (winner) {
        bbq.frontend.handleCollect(winner);
    }); // end
}

bbq.frontend.handleCollect = function(winner) {
    SharedSession.gameObj.collect(function (scoring) {
        var playerObj = boc.utils.getPlayer(SharedSession.user.playerid);
        var playerSummary = playerObj.summary;

        playerSummary.turns = playerObj.turn;
        var summaryWindow = new bbq.frontend.GameHUD.SummaryWindow(winner, playerSummary, scoring);
        summaryWindow.onContinueClick = function () {
            bbq.frontend.handleGameWin(winner);
            SharedSession.refreshUser();
        } // onContinueClick
    }); // collect
} // handleCollect

bbq.frontend.handleGameWin = function(winner) {
    new bbq.frontend.GameHUD.ToastWindow("Game over! Winner is " + winner + "!", 6000);
    //SharedSession.gameObj.disableControls();
    SharedSession.gameObj.clearFog();
} // handleGameWin

//bbq.frontend.gameContext = {};
bbq.frontend.onScriptLoaded = function (gameState, hud, callback, isTutorial) {    
    //debugger;
    var onEverythingLoaded = function () {
        //loadingWindow.remove();

        var em = boc.core.Entity_internal.em();
        em.clear();
        var game = null;
        //var gameState = null;
        //var hud = hud;//new bbq.hud.HtmlHud('hud');        
		//debugger;
		var canvas = $('canvas')[0];
        if (!canvas) {
            canvas = document.createElement('canvas');
			canvas.classList.add('viewport');
            //canvas.width = bbq.frontend.width || 960;
            //canvas.height = bbq.frontend.height || 640;
        	//var sc = document.getElementById("sceneContainer");
			//sc.appendChild(canvas);
		}
		
        hud.canvas(canvas);
		bbq.frontend.fillScreen();

		if (!isTutorial) {
		    var game = new bbq.Game({
		        gameState: gameState,
		        canvas: canvas,
		        entityManager: em,
		        user: SharedSession.user,
		        hud: hud,
		        onLoad: function (gameObj) {
		            var music = bbq.sh().getAudio('music/forest');
		            if (music) {
		                music.volume = 0;
		                bbq.sh().play(music, true);
		                bbq.sh().fadeIn(music);
		            }
		            
		            gameObj.victoryCondition = bbq.VictoryConditions.captureHQ;
		            gameObj.onvictory = function () {
		                gameObj.end(1, function (winner) {
		                    gameObj.collect(function (reward) {
		                        gameObj.clearFog();
                                var music = bbq.sh().getAudio('music/forest');
                                bbq.sh().fadeOut(music, 3000, function () {
			                        var victoryMusic = bbq.sh().getAudio('effects/victory');
									bbq.sh().play(victoryMusic);
                                	bbq.sh().fadeOut(victoryMusic, 450, function () {
										bbq.sh().fadeIn(music);
									});
								});

		                        bbq.frontend.toast('You win!', { id: 'sceneContainer' });
		                        var userPlayer = SharedSession.gameObj.getPlayer(SharedSession.user.playerid);
		                        var totalReward = reward.turnTokens + reward.foodTokens + reward.buildingTokens + reward.winBonus.tokens + reward.itemBonus.tokens;
		                        hud.summary(userPlayer.summary, userPlayer.turn, SharedSession.gameObj.map().avgTurnsToWin(), totalReward);
		                        hud.openSummaryWindow('You Win!');
		                    });
		                });
		            };
		            gameObj.start();

		            //game.start();

		            $('.toast').remove();

		            SharedSession.gameObj = gameObj;

		            var winner = gameObj.winner();
		            if (winner) {		                
                        SharedSession.gameObj.collect(function (reward) {
                            gameObj.clearFog();
                            var isWinner = winner === SharedSession.user.playerid;
                            bbq.frontend.toast('You ' + (isWinner ? 'win' : 'lose') + '!', { id: 'sceneContainer' });
                            var userPlayer = SharedSession.gameObj.getPlayer(SharedSession.user.playerid);
                            var totalReward = reward.turnTokens + reward.foodTokens + reward.buildingTokens + reward.winBonus.tokens + reward.itemBonus.tokens;
                            hud.summary(userPlayer.summary, userPlayer.turn, SharedSession.gameObj.map().avgTurnsToWin(), totalReward);
                            bbq.sh().play(bbq.sh().getAudio(isWinner ? 'effects/victory' : 'effects/defeat'));
                            hud.openSummaryWindow(isWinner ? 'You win!' : 'You lose!');
                        });		                    		                
		            } // there's a winner
		            else {
		                if (SharedSession.turnClient) {
		                    SharedSession.turnClient.disconnect();
		                }
		                SharedSession.turnClient = new bbq.TurnClient(SharedSession.sessionKey);
		                SharedSession.turnClient.on('connect', function () {
		                    if (SharedSession.user.playerid != SharedSession.gameObj.getCurrentPlayer().id)
		                        SharedSession.turnClient.wait(SharedSession.gameObj.id());
		                });
		                SharedSession.turnClient.on('disconnect', function () {

		                });
		                SharedSession.turnClient.on('your turn', function (gameDoc) {
		                    SharedSession.gameObj.load(gameDoc, function () {
		                        $('.toast').remove();
		                        bbq.frontend.toast('Your turn', { id: 'sceneContainer' });
		                        bbq.frontend.showEndTurn();
		                    });
		                });
		                SharedSession.turnClient.connect();
		                if (SharedSession.user.playerid != gameObj.getCurrentPlayer().id) {
		                    bbq.frontend.toast('Waiting for your turn', { id: 'sceneContainer', delay: -1 });
		                    // hide end turn
		                    bbq.frontend.hideEndTurn();
		                    //bbq.frontend.waitForTurn();
		                } else {
		                    bbq.frontend.toast('Your turn', { id: 'sceneContainer' });
		                    bbq.frontend.showEndTurn();
		                }
		                
		            } // no winner	            
		            if (callback) {
		                callback();
		            }
		        } //onLoad
		    }); // new Game
		}
		else {
		    var tutorial = new bbq.Tutorial(
                'tutorial', 
                {
		            gameState: gameState,
		            canvas: canvas,
		            entityManager: em,
		            user: SharedSession.user,
		            hud: hud		            
		        },
		        function (gameObj) {
		            var music = bbq.sh().getAudio('music/forest');
		            if (music) {
		                music.volume = 0;
		                bbq.sh().play(music, true);
		                bbq.sh().fadeIn(music);
		            }
		            
		            //gameObj.victoryCondition = bbq.VictoryConditions.captureHQ;
		            //gameObj.onvictory = bbq.frontend.handleUserWin;
		            //gameObj.start();

		            $('.toast').remove();

		            SharedSession.gameObj = gameObj;

		            //if (SharedSession.user.playerid != gameObj.getCurrentPlayer().id) {
		            //    bbq.frontend.toast('Waiting for your turn', { id: 'sceneContainer', delay: -1 });
		            //} else {
		            //    bbq.frontend.toast('Your turn', { id: 'sceneContainer' });
		            //}

		            if (callback) {
		                callback();
		            }
		        } // onload
		    );
		} // tutorial              
    }; // onEverythignComplete

    var loadsComplete = 0;
    var done = function () {
        var loadsToComplete = 4;
        if (++loadsComplete == loadsToComplete) {
            onEverythingLoaded();
        }
    };

    boc.sm().loadFiles(bbq.assets.sounds, done);

    boc.resources.GraphicsManager.loadFiles([
        'assets/graphics/pfx_smoke_small.png',
        'assets/graphics/pfx_star_small.png',
        'assets/graphics/attackButton.png',
        'assets/graphics/cancelButton.png',
        'assets/graphics/captureButton.png',
        'assets/graphics/gatherButton.png',
        'assets/graphics/trainButton.png',
        'assets/graphics/holdButton.png',
        'assets/graphics/moveButton.png',
        'assets/graphics/healButton.png',
        'assets/graphics/revealButton.png',
        'assets/graphics/forestTiles.png',
        'assets/graphics/tutorial_arrow.png',
        'ui/images/icon_food_small.png'
    ], done);

    boc.resources.GraphicsManager.load(bbq.assets.graphics, done);

    var allSpinePaths = [];
    var units = bbq.units.configuration.baseLoadout;
    units = units.concat(bbq.units.configuration.unlockableUnits);
    for (var u = 0; u < units.length; u++) {
        allSpinePaths.push(bbq.units.configuration[units[u]].spinePath);
    }
    
    // gets all the spine assets
    var teams = ['blue', 'red'];
    boc.spine.loadSpineAssets(
        allSpinePaths,
        {
            teams: teams,
            onload: function (assets) {
                // put it in memory
                boc.spine.SkeletonManager.load(assets);

                // render a "default image" for each unit and put it in the cache
                for (var i = 0; i < units.length; i++) {
                    for (var j = 0; j < teams.length; j++) {
                        var team = teams[j];
                        var img = boc.resources.GraphicsManager.getImage(units[i] + '_' + team);
                        if (!img) {
                            var canvas = document.createElement('canvas');
                            canvas.width = 100;
                            canvas.height = 100;
                            var context = canvas.getContext('2d');
                            var skele = boc.spine.SkeletonManager.createSkeleton(units[i].toLowerCase() + '_' + team, { x: 50, y: -50 });
                            skele.setSkinByName('defaultSkin');
                            skele.setSlotsToSetupPose();
                            boc.spine.renderSkeleton(skele, context);
                            img = document.createElement('img');
                            img.width = 100;
                            img.height = 100;
                            img.src = canvas.toDataURL();
                            boc.resources.GraphicsManager.addImage(units[i] + '_' + team, img);
                        }
                    } // j
                } // i
                done();
            } // onload
        } // onLoadSpineAssets
    );

}

bbq.frontend.gameLoadScripts = function (gameState, hud, callback, tutorial) {
    bbq.frontend.toast('Loading...', { id: 'sceneContainer', delay: -1, position: 'center', fade: false });
    var music = bbq.sh().getAudio('music/menu');
    bbq.sh().fadeOut(music, 4000, function () {
        bbq.sh().reset(music);
    });

    // load scripts if it hasn't already been loaded
    if (!SharedSession.user.scriptsLoaded) {
        //var scripts = [
        //    'assets/graphics/graphics.js',
        //    'libs/bbq/components.js',
        //    'libs/bbq/systems.js',
        //    'libs/bbq/gamedata.js',
        //    'libs/bbq/tiles.js',
        //    'libs/bbq/ui.js',
        //    'libs/bbq/game.js',
        //    'libs/bbq/map.js',
        //    'libs/bbq/units.js',
        //    'libs/bbq/buildings.js',
        //    'libs/bbq/algorithms.js',
        //    'libs/bbq/commands.js',
        //        'libs/bbq/commands/heal.js',
        //        'libs/bbq/commands/reveal.js',
        //    'libs/bbq/unitset.js',
        //    'libs/bbq/hud.js'
        //];
        var scripts = ['assets/graphics/graphics.js'].concat(include.bbq_deferred || []);

        var numScriptsLoaded = 0;
        for (var i = 0; i < scripts.length; i++) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = scripts[i];
            script.onload = function () {
                numScriptsLoaded++;
                //debugger;
                if (numScriptsLoaded == scripts.length) {
                    SharedSession.user.scriptsLoaded = true;                    
                    bbq.frontend.onScriptLoaded(gameState, hud, callback, tutorial);
                };
            }
            document.getElementsByTagName('head')[0].appendChild(script);
        }
    }
    // scripts already loaded
    else {
        //if (callback) {
        //    callback();
        //}        
        bbq.frontend.onScriptLoaded(gameState, hud, callback, tutorial);        
    }
} // bbq.frontend.gameLoadScripts


// JavaScript Document
var windowsOpened = 0;
var windowStack = new Array();

function showWindow(id, onComplete) {
    if (windowStack.length == 0) {
        $(".fadeBlack").fadeIn(200, onComplete);
    }

    if (windowStack.length > 0) {
        $(windowStack[windowStack.length - 1]).fadeOut(200);
    }

    $(id).slideDown(200, onComplete);

    windowStack.push(id);

    windowsOpened++;
    console.log(windowStack);
}

function hideWindow(totalWindows, onComplete) {
    if (windowsOpened > 0) {
        windowsOpened--;
    }

    if (windowStack.length > 0) {
        $(windowStack[windowStack.length - 1]).fadeOut(200);
    }

    if (totalWindows == undefined) {
        totalWindows = 1;
    }

    if (windowStack.length == 1) {
        windowStack.pop();
    } else if (totalWindows > 0) {
        windowStack.splice(windowStack.length - totalWindows, windowStack.length);
    }

    if (windowStack.length > 0) {
        $(windowStack[windowStack.length - 1]).slideDown(200, onComplete);
    } if (windowStack.length == 0) {
        $(".fadeBlack").fadeOut(200, onComplete);
    }

    console.log(windowStack);
}

bbq.frontend.setupDirector = function () {
    boc.utils.requestApiKey();

    (function (containerId) {
        var sceneDiv = null;
        var currentScene = 0;
        var scenes = []; // jquery objects

        function scrollToIndex(index, onAnimationsFinished) {
            if (index == currentScene) {
                $(scenes[index]).css('display', '');
                if (onAnimationsFinished) { onAnimationsFinished(); }
                return;
            }
            $(scenes[index]).css('display', '');
            var offsetBy = '-=' + ($(scenes[index]).position().left - $(scenes[currentScene]).position().left);
            var animsFinished = 0;
            for (var i = 0; i < scenes.length; i++) {
                $(scenes[i]).animate({ left: offsetBy }, 350, function () {
                    animsFinished++;
                    if (animsFinished == scenes.length && onAnimationsFinished) {
                        onAnimationsFinished();
                    } // if
                });
            } // i
        }

        function armLinks(scene, iter) {
            $('a[href="' + iter.src + '"]').attr('href', '#').click(function () {
                director.pop();
            });
            for (var i = 0; i < iter.links.length; i++) {
                (function (iterLink) {
                    $('a[href="' + iterLink.src + '"]').attr('href', '#').click(function () {
                        if (!$(this).attr('disabled')) {
                            director.push(iterLink.src, iterLink.onsceneload, iterLink.onsceneunload, iterLink.onscrollend, iterLink.onreplaceend);
                        }
                    });
                })(iter.links[i]);
            }
        }


        window.director = {};
        director.setContainer = function (c) {
            sceneDiv = c;
        };


        var storyboard = null;
        var iterator = null; // current, for convenience
        var iteratorStack = [];
        director.setStoryboard = function (sb) {
            storyboard = sb;
            iterator = sb;
            iteratorStack.push(iterator);
            director.push(iterator.src, iterator.onsceneload, iterator.onsceneunload, iterator.onscrollend, iterator.onreplaceend);
        };

        director.push = function (src, onSceneLoad, onSceneUnload, onScrollEnd, onReplaceEnd) {
            var scene = $('<div>').addClass('scene').addClass('noSelect').addClass('noDrag').css('display', 'none');
            scene.onsceneload = onSceneLoad;
            scene.onsceneunload = onSceneUnload;
            scene.onpushscrollend = onScrollEnd;
            scene.onreplaceend = onReplaceEnd;
            scene.load(src, function () {
                //$(this).css('display', '');
                scenes.push(scene);
                $(sceneDiv).append(this);
                armLinks(scene, iterator);
                if (storyboard) {
                    var hasLink = false;
                    for (var i = 0; i < iterator.links.length; i++) {
                        if (iterator.links[i].src === src) {
                            iteratorStack.push(iterator);
                            iterator = iterator.links[i];
                            hasLink = true;
                            break;
                        }
                    } //
                    //debugger;
                    if (!hasLink) {
                        iteratorStack.push(iterator);
                    }
                } // storyboard

                if (scenes.length == 1) {
                    $(scene).css('display', '');
                    if (scene.onsceneload) { scene.onsceneload(); }
                    return;
                }

                var currSceneLeft = $(scenes[currentScene]).position().left + $(scenes[currentScene]).width();
                $(scene).css('left', currSceneLeft + 'px');
                //console.log(currSceneLeft);
                if (scene.onsceneload) { scene.onsceneload(); }
                scrollToIndex(currentScene + 1, function () {
                    if (scene.onpushscrollend) { scene.onpushscrollend(); }
                    currentScene++;
                });
            });
        };

        director.pop = function () {
            if (storyboard) {
                iteratorStack.pop();
                iterator = iteratorStack[iteratorStack.length - 1];
            } // storyboard

            if (currentScene == 0) {
                var scene = scenes.pop();
                if (scene.onsceneunload) { scene.onsceneunload(); }
                $(scene).remove();
                return;
            }
            if (scenes[currentScene - 1].onload) { scenes[currentScene - 1].onload(); }
            scrollToIndex(currentScene - 1, function () {
                var scene = scenes.pop();
                if (scene.onsceneunload) { scene.onsceneunload(); }
                $(scene).remove();
                currentScene--;
            });
        };

        director.replace = function () {
            // first get the scene to replace's left position
            $(scene).css('left', $(scenes[currentScene]).css('left'));

            // now unload it
            if (scenes[currentScene].onsceneunload) { scenes[currentScene].onsceneunload(); }
            $(scenes[currentScene]).remove();

            // and replace it with the new scene
            $(sceneDiv).append(scene);
            scenes[currentScene] = scene;
            armScene(scene);
            if (scene.onsceneload) { scene.onsceneload(); }
            if (scene.onreplaceend) { scene.onreplaceend(); }
        };

        director.currentScene = function () {
            return scenes[currentScene];
        }
    })('sceneContainer');

    $(document).ready(function() {
        var storyboard = {
            src: 'mainMenu3.html', 
            onsceneload: function () {
            },
            links: [
                {
                    src: 'createAccount.html',
                    onsceneload: function () { },
                    links: []
                },
                {
                    src: 'battleMenu3.html',
                    onsceneload: function () { },
                    onsceneunload: function () {
                        //debugger;
                        var backClickElement = this.find('#battle_backButton')[0];
                        if (backClickElement && backClickElement.clearAutoRefresh) {
                            backClickElement.clearAutoRefresh();
                        }
                    },
                    links: []
                },
                {
                    src: 'myChieftain.html',
                    onsceneload: function () { },
                    links: []
                },
                {
                    src: 'myTribe.html',
                    onsceneload: function () { },
                    links: []
                },
                {
                    src: 'friends.html',
                    onsceneload: function () { },
                    links: []
                }
            ] //links
        }; // mainMenu3.html                        
        director.setContainer($('#sceneContainer')[0]);
        director.setStoryboard(storyboard);
    });
} // setupDirector

bbq.frontend.setupBattleMenu = function() {
    function refreshFooter() {
        $('.footerLevel .footerLevelValue').text(SharedSession.user.level);
        $('.footerLevel .footerValue').text(SharedSession.user.playerid);
        $('.footerBattleBadges .footerValue').text(SharedSession.user.skulls);
        $('.footerTribeTokens .footerValue').text(SharedSession.user.shields);
    }

    $("#footer").load("footer.html", function () {
        refreshFooter();
    });
    $("#purchaseWindow").load("purchaseWindow.html");
    //function bbq.frontend.refreshMatches(onRefreshComplete) {
    //    SharedSession.user.pendingMatches = [];
    //    SharedSession.user.activeMatches = [];
    //    SharedSession.user.retiredMatches = [];
    //    SharedSession.user.pendingChallengeRequests = [];
    //    SharedSession.user.pendingChallengeReplies = [];
    //    boc.utils.getJson('getmatches', { playerid: SharedSession.user.playerid },
    //        function (json) {
    //            if (json.status == 'ok') {
    //                //debugger;
    //                for (var i = 0; i < json.result.length; i++) {
    //                    var status = json.result[i].status;
    //                    if (status == 'pending') {
    //                        SharedSession.user.pendingMatches.push(new bbq.Match(json.result[i]));
    //                    }
    //                    else if (status == 'active') {
    //                        SharedSession.user.activeMatches.push(new bbq.Match(json.result[i]));
    //                    }
    //                    else if (status == 'retired') {
    //                        SharedSession.user.retiredMatches.push(new bbq.Match(json.result[i]));
    //                    }
    //                    else if (status == 'challenging') {
    //                        SharedSession.user.pendingChallengeRequests.push(new bbq.Match(json.result[i]));
    //                    }
    //                    else if (status == 'challenged') {
    //                        SharedSession.user.pendingChallengeReplies.push(new bbq.Match(json.result[i]));
    //                    }
    //                } // for i

    //                //debugger;
    //                // let's sort by lastupdate
    //                SharedSession.user.pendingMatches.sort(function (a, b) { return b.lastupdate - a.lastupdate; });
    //                SharedSession.user.activeMatches.sort(function (a, b) { return b.lastupdate - a.lastupdate; });
    //                SharedSession.user.retiredMatches.sort(function (a, b) { return b.lastupdate - a.lastupdate; });
    //                SharedSession.user.pendingChallengeRequests.sort(function (a, b) { return b.lastupdate - a.lastupdate; });
    //                SharedSession.user.pendingChallengeReplies.sort(function (a, b) { return b.lastupdate - a.lastupdate; });
    //            }
    //            if (onRefreshComplete) { onRefreshComplete(); }
    //        } // callback
    //    ); // getjson
    //} // bbq.frontend.refreshMatches
    $('.section').empty();

    var pendingMatches = 1;
    var matchingHtml = '<div class="btnBattle btnBattleMargin"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleYourTurnImage"><div class="btnBattleContent"><div class="btnBattleUsername">Finding opponent...</div></div></div></div>';
    var yourTurnHtml = '<div class="btnBattle btnBattleMargin battlePanel"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleYourTurnImage"><div class="btnBattleContent"><div class="btnBattleUsername">$opponent</div><div class="btnBattleMap">$mapid</div><div class="btnBattleTurn">Your turn</div></div></div></div>';
    var oppTurnHtml = '<div class="btnBattle btnBattleMargin battlePanel"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleWaitingImage"><div class="btnBattleContent"><div class="btnBattleUsername">$opponent</div><div class="btnBattleMap">$mapid</div><div class="btnBattleTurn">Waiting...</div></div></div></div>';
    var retiredHtml = '<div class="btnBattle btnBattleMargin replayPanel"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleFinishedImage"><div class="btnBattleContent"><div class="btnBattleUsername">$opponent</div><div class="btnBattleMap">$mapid</div><div class="btnBattleResult btnBattleVictory"></div></div></div></div>';
    var challengeReplyHtml = '<div class="btnBattle btnBattleMargin"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleYourTurnImage"><div class="btnBattleContent"><div class="btnBattleUsername" style="text-align:right">$friendName</div><div class="btnBattleMap">has challenged you!</div><div style="margin-top:35px"><div index="$i" class="btnAccept" style="margin-left:5px" ></div><div index="$i" class="btnDecline" ></div></div></div></div></div>';
    var challengeRequestHtml = '<div class="btnBattle btnBattleMargin"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleWaitingImage"><div class="btnBattleContent"><div class="btnBattleMap">Challenging</div><div class="btnBattleUsername" style="text-align:right">$friendName</div><div class="btnBattleMap">Awaiting reply</div></div></div></div>';
    var winLoseHtml = '<div class="btnBattle btnBattleMargin battlePanel"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleYourTurnImage"><div class="btnBattleContent"><div class="btnBattleUsername" style="text-align:right">$opponent</div><div class="btnBattleMap">You\'ve $winlose! Click to collect.</div></div></div></div>';
    function updateBattlePanels() {
        bbq.frontend.refreshMatches(function () {
            // create the panels
            $('.section').empty();
            //debugger;
            for (var i = 0; i < SharedSession.user.pendingMatches.length; i++) {
                var match = SharedSession.user.pendingMatches[i];
                $(matchingHtml)
                    .addClass('searching')
                    .attr('matchid', match.matchid)
                    .prependTo($('#currentBattles'));
            }
            pendingMatches = SharedSession.user.pendingMatches.length;

            for (var i = 0; i < SharedSession.user.pendingChallengeReplies.length; i++) {
                var match = SharedSession.user.pendingChallengeReplies[i];
                $(challengeReplyHtml.replace(/\$friendName/g, match.opponent).replace(/\$i/g, i))
                    .addClass('challengeReply')
                    .prependTo($('#currentBattles'));
            }

            for (var i = 0; i < SharedSession.user.pendingChallengeRequests.length; i++) {
                var match = SharedSession.user.pendingChallengeRequests[i];
                $(challengeRequestHtml.replace(/\$friendName/g, match.opponent).replace(/\$i/g, i))
                    .prependTo($('#currentBattles'));
            }

            var notYourTurn = []
            for (var i = 0; i < SharedSession.user.activeMatches.length; i++) {
                var match = SharedSession.user.activeMatches[i];
                if (match.winner) {
                    var winLose = SharedSession.user.playerid == match.winner ? 'win' : 'lose';
                    $(winLoseHtml.replace('$opponent', match.opponent).replace('$winlose', winLose))
                        .attr('matchid', match.matchid)
                        .attr('gameid', match.gameid)
                        .attr('winner', match.winner)
                        .prependTo($('#currentBattles'));
                }
                else if (match.turn == SharedSession.user.playerid) {
                    $(yourTurnHtml.replace('$mapid', match.mapid).replace('$opponent', match.opponent))
                        .attr('matchid', match.matchid)
                        .attr('gameid', match.gameid)
                        .appendTo($('#currentBattles'));
                }
                else {
                    notYourTurn.push(match);
                }
            }
            notYourTurn.reverse();
            while (notYourTurn.length > 0) {
                var match = notYourTurn.pop();
                if (match.winner) {
                    var winLose = SharedSession.user.playerid == match.winner ? 'win' : 'lose';
                    $(winLoseHtml.replace('$opponent', match.opponent).replace('$winlose', winLose))
                        .attr('matchid', match.matchid)
                        .attr('gameid', match.gameid)
                        .attr('winner', match.winner)
                        .prependTo($('#currentBattles'));
                }
                else {
                    $(oppTurnHtml.replace('$mapid', match.mapid).replace('$opponent', match.opponent))
                        .attr('matchid', match.matchid)
                        .attr('gameid', match.gameid)
                        .appendTo($('#currentBattles'));
                }
            }

            for (var i = 0; i < SharedSession.user.retiredMatches.length; i++) {
                var match = SharedSession.user.retiredMatches[i];
                $(retiredHtml.replace('$mapid', match.mapid).replace('$opponent', match.opponent))
                    .attr('matchid', match.matchid)
                    .attr('gameid', match.gameid)
                    .appendTo($('#finishedBattles'));
            }

            function battleReply(element, action) {
                var index = +$(element).attr('index');
                var match = SharedSession.user.pendingChallengeReplies[index];
                boc.utils.getJson('battle/' + action,
                    { matchid: match.matchid, challengeid: match.challengeid },
                    function (json) {
                        if (json) {
                            if (json.status == 'ok') {
                                updateBattlePanels();
                            }
                            else {
                                alert(json.result);
                            }
                        }
                    }
                );
            }

            $('.challengeReply .btnDecline').click(function () {
                battleReply(this, 'decline');
            });

            $('.challengeReply .btnAccept').click(function () {
                battleReply(this, 'accept');
            });

            // arm events
            $('.battlePanel').click(function () {
                SharedSession.user.currentGame = $(this).attr('gameid');
                //director.push = function (src, onSceneLoad, onSceneUnload, onScrollEnd, onReplaceEnd)
                // collect
                var loadingWindow = new bbq.frontend.GameHUD.ModalWindow('Loading...');
                var winner, callback;
                if (winner = $(this).attr('winner')) {
                    callback = function () {
                        loadingWindow.remove();
                        bbq.frontend.handleCollect(winner);                        
                    };
                } else {
                    callback = function () {
                        loadingWindow.remove();
                    };
                }

                director.push('game2.html',
                    function () {
                        clearTimeout(autoRefreshId);
                        //debugger;
                        loadingWindow.show($('canvas').parent(), 'loadingDiv');
                    },
                    function () {
                        SharedSession.user.currentGame = null;
                        updateBattlePanels();
                        refreshFooter();
                        //SharedSession.gameObj.end(function () {
                        //    SharedSession.gameObj = null;
                        //});
                    },
                    function () {
                        bbq.frontend.gameLoadScripts(callback);
                    }
                );
            });

            $('.replayPanel').click(function () {
            });
        });
    } // updateBattlePanels	

    var autoRefreshId = null;
    function autoRefresh() {
        var pendingPanels = $('.searching');

        var doRefresh = false;
        var requestsComplete = 0;
        for (var i = 0; i < pendingPanels.length; i++) {
            (function (matchid) {
                boc.utils.getJson('get/matches', { matchid: matchid, _fields: 'status' }, function (json) {
                    if (json.status == 'ok') {
                        for (var m = 0; m < json.result.length; m++) {
                            if (json.result[m].status == 'active') {
                                doRefresh = true;
                            }
                        } //m
                    }// ok
                    requestsComplete++;
                    if (requestsComplete == pendingPanels.length && doRefresh) {
                        updateBattlePanels();
                        //bbq.frontend.refreshMatches(function () {
                        //    updateBattlePanels();
                        //});
                    }
                });
            })($(pendingPanels[i]).attr('matchid'));
        } // i
        autoRefreshId = setTimeout(function () { autoRefresh(); }, 5000);
    }

    $('#battlematch').click(function () {
		if (pendingMatches == 0) {
            boc.utils.getJson('matchmake', {}, function (data) {
                if (data.status == 'ok') {
                    $(matchingHtml)
                        .addClass('searching')
                        .attr('matchid', data.result.matchid)
                        .prependTo($('#currentBattles'));
                    pendingMatches = 1;
                }
            });
        }
    });

    $('#battle_backButton')[0].clearAutoRefresh = function () {
        //debugger;
        clearTimeout(autoRefreshId);
    }

    updateBattlePanels();
    autoRefresh();
};

bbq.frontend.setupFriends = function () {
    $("#btnAddFriend").click(function () { showWindow("#addFriendWindow") });
    $("#addFriendClose").click(function () { hideWindow() });
    $("#footer").load("footer.html", function () {
        if (typeof (SharedSession) != 'undefined') {
            $('.footerLevel .footerLevelValue').text(SharedSession.user.level);
            $('.footerLevel .footerValue').text(SharedSession.user.playerid);
            $('.footerBattleBadges .footerValue').text(SharedSession.user.skulls);
            $('.footerTribeTokens .footerValue').text(SharedSession.user.shields);
        }
    });
    $("#purchaseWindow").load("purchaseWindow.html");

    function replyToRequest(friendId, responseType) {
        boc.utils.post('friend/' + responseType, { playerid: friendId },
            function (json) {
                if (json && json.status == 'ok') {
                    //alert(json.result);
                } else {
                    alert('something went wrong with friend ' + responseType);
                }
                showFriends();
            }
        );
    }

    function refreshFriendList() {
        if (typeof (SharedSession) != 'undefined') {
            $('#friendContainer').empty();

            var reqHtml = '<div class="btnBattle btnBattleMargin"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleFinishedImage"><div class="btnBattleContent"><div class="btnBattleMap">Waiting for</div><div class="btnBattleUsername" style="text-align:right">$friendName</div> <div class="btnBattleMap">to reply</div></div></div></div>';
            var resHtml = '<div class="btnBattle btnBattleMargin"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleWaitingImage"><div class="btnBattleContent"><div class="btnBattleMap">Request from</div><div class="btnBattleUsername" style="text-align:right">$friendName</div><div style="margin-top:35px"><div id="acceptBtn$i" class="btnAccept" style="margin-left:5px" ></div><div id="declineBtn$i" class="btnDecline" ></div></div></div></div></div>';
            var cfmHtml = '<div class="btnBattle btnBattleMargin"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleYourTurnImage"><div class="btnBattleContent"><div class="btnBattleUsername">$friendName</div><div id="unfriendBtn$i" class="windowUniversalCompactButton btnUnfriend"></div><div id="battleBtn$i" class="windowUniversalCompactButton btnBattleFriend"></div></div></div></div>';

            for (var i = 0; i < SharedSession.user.pendingFriendResponses.length; i++) {
                var friendName = SharedSession.user.pendingFriendResponses[i];
                $('#friendContainer').append($(resHtml.replace('$friendName', friendName).replace(/\$i/g, i)));
                (function (fn, k) {
                    $('#acceptBtn' + k).click(function () {
                        replyToRequest(fn, 'confirm');
                    });
                    $('#declineBtn' + k).click(function () {
                        replyToRequest(fn, 'decline');
                    });
                })(friendName, i);
            }
            for (var i = 0; i < SharedSession.user.friends.length; i++) {
                var friendName = SharedSession.user.friends[i];
                $('#friendContainer').append($(cfmHtml.replace('$friendName', friendName).replace(/\$i/g, i)));
                (function (fn, k) {
                    $('#battleBtn' + i).click(function () {
                        boc.utils.getJson('battle/challenge',
                            { opponentid: fn },
                            function (json) {
                                if (json) {
                                    alert(json.result);
                                }
                            }
                        );
                    });

                    $('#unfriendBtn' + i).click(function () {
                        // TODO: impelment unfriend
                    });
                })(friendName, i);
            }
            for (var i = 0; i < SharedSession.user.pendingFriendRequests.length; i++) {
                var friendName = SharedSession.user.pendingFriendRequests[i];
                $('#friendContainer').append($(reqHtml.replace('$friendName', friendName).replace(/\$i/g, i)));
            }
        }
    }

    function showFriends() {
        if (typeof (SharedSession) != 'undefined' && boc.utils.getJson) {
            SharedSession.user.friends = [];
            SharedSession.user.pendingFriendRequests = [];
            SharedSession.user.pendingFriendResponses = [];

            boc.utils.getJson('get/friends', { playerid: SharedSession.user.playerid },
                function (json) {
                    if (json.status == 'ok') {
                        for (var i = 0; i < json.result.length; i++) {
                            var friendObj = json.result[i];
                            if (friendObj.requestStatus == 'confirm') {
                                SharedSession.user.friends.push(friendObj.friendid);
                            } else if (friendObj.requestStatus == 'pending') {
                                SharedSession.user.pendingFriendRequests.push(friendObj.friendid);
                            }
                        }
                        boc.utils.getJson('get/friends', { friendid: SharedSession.user.playerid, requestStatus: 'pending' },
                            function (json2) {
                                if (json2.status == 'ok') {
                                    for (var i = 0; i < json2.result.length; i++) {
                                        var friendObj = json2.result[i];
                                        SharedSession.user.pendingFriendResponses.push(friendObj.playerid);
                                    }
                                    refreshFriendList();
                                } else {
                                    alert('failed friend retrieval!!');
                                }
                            }
                        );

                    } else {
                        alert('failed friend retrieval!!');
                    }
                }
            );
        }
    }
    debugger;
    $('#friendContainer').empty();
    showFriends();
    //$('#btnAddFriend').show();

    $('#friendSend').click(function () {
        boc.utils.post('friend/request', { playerid: $('#friendName').val() }, function (json) {
            if (json && json.status == 'ok') {
                showFriends();
            } else {
                alert(json.result);
            }
            hideWindow(); // common.js
        });
    });
};

bbq.frontend.setupCreateAccount = function () {
    //$("#btnAddFriend").click(function () {showWindow("#addFriendWindow")});
    $("#addFriendClose").click(function () { hideWindow() });
    $("#footer").load("footer.html");
    $("#purchaseWindow").load("purchaseWindow.html");
    Recaptcha.create(
		RECAPTCHA_KEY,
		'recaptchaDiv',
		{
		    theme: 'custom',
		    custom_theme_widget: 'recaptchaCustomWidget',
		    callback: function () {
		        //$('#recaptcha_image img').width($('#recaptcha_image').width()); 
		        //$('#recaptcha_response_field').css('height','1.2em'); 
		    }
		}
	);
    $('#btnCreateAccount').click(function () {
        if ($('input[name="create_email"]').val() == '') {
            $('.createAccountMessageBg').text('Email must be non-empty!').show();
            return;
        }
        if ($('input[name="displayName"]').val() == '') {
            $('.createAccountMessageBg').text('Name must not be empty!').show();
            return;
        }

        if ($('input[name="create_password"]').val() == '') {
            $('.createAccountMessageBg').text('Password must not be empty!').show();
            return;
        }
        if ($('input[name="create_password"]').val() != $('input[name="confirm_password"]').val()) {
            $('.createAccountMessageBg').text('Passwords don\'t match!').show();
            return;
        } // not same password

        boc.utils.getJson('createuser',
            {
                name: $('input[name="displayName"]').val(),
                email: $('input[name="create_email"]').val(),
                password: encryptedString(boc.utils.API_KEY, '^$' + $('input[name="create_password"]').val()),
                recaptcha_challenge_field: Recaptcha.get_challenge(),
                recaptcha_response_field: Recaptcha.get_response()
            },
            function (data) {
                if (data.status == 'ok') {
                    alert(data.result);
                    $('#create_back').click();
                    //director.pop();
                } else {
                    //alert(data.result);
                    $('.createAccountMessageBg').text(data.result);
                    Recaptcha.reload();
                }
            } // data
        ); // getJson
    });
};

bbq.frontend.setupMainMenu = function () {
    $("input[name='password']").keyup(function (e) {
        if (e.keyCode == 13) {
            $('.btn_signIn').click();
        }
    });

    $('.btn_signIn').click(function () {
        //debugger;
        // do ajax login crap here					
        var token = encryptedString(boc.utils.API_KEY, ($('input[name="username"]').val() + '+' + $('input[name="password"]').val() + '+' + (+new Date)));
        boc.utils.getJson('login/' + token, {}, function (json) {
            if (json.status == 'ok') {
                SharedSession.sessionKey = json.result.boc_session;
                boc.utils.getJson('userinfo', {}, function (json) {
                    if (json.status == 'ok') {
                        SharedSession.user = new bbq.User(json.result);

                        // TODO: remove this later. this is for testing purposes only
                        //SharedSession.user.chieftan = ChieftanFactory.createChieftan($('#spellDropdown').val());
                        //$('#spellDropdown').change();

                        // end todo

                        //director.push(makeScene('mainmenu'));
                        //alert('login successful');
                        $('.disabled').removeClass('disabled');
                        $('a').removeAttr('disabled');
                        $('.signIn').hide();
						$('#mainMenuButtons').show();
						debugger;
                    } // statusok 
                    else {
                        alert(json.result);
                    } // statserror
                }); // getJson

            } else {
                alert(json.result);
            }
        });
    }); // signin click
};

bbq.frontend.setupGame = function (p) {
    //var em = boc.core.Entity_internal.em();
    //var game = null;
    //var gameState = null;
    //var canvas = $('canvas')[0];
    //if (!canvas) {
    //    canvas = document.createElement('canvas');
    //    canvas.width = p.width || 960;
    //    canvas.height = p.height || 640;
    //}
    if (p && p.width) {
        bbq.frontend.width = p.width;
    }
    if (p && p.height) {
        bbq.frontend.height = p.height;
    }
    var bcallback = function (e) {
        e.preventDefault();
    };
    document.addEventListener('touchmove', bcallback);    
}