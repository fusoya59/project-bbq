/// <reference path="components.js" />
/// <reference path="game.js" />
/// <reference path="map.js" />
/// <reference path="user.js" />
/// <reference path="session.js" />
/// <reference path="../core/components.js" />
/// <reference path="../core/entitysystem.js" />
/// <reference path="../core/utils.js" />

if (!window.bbq) { window.bbq = {}; }
if (!bbq.frontend) { bbq.frontend = {}; }

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
        var div = $('<div>').addClass('panel').addClass('game_waiting').text(message).hide();
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
                                gameid: SharedSession.gameObj.id(),
                            },
                            function (data) {
                                if (data && data.status == 'ok') {
                                    gameState = data.result[0];
                                    SharedSession.gameObj.load(gameState);
                                    new bbq.frontend.GameHUD.ToastWindow('Your turn!', 3000);
                                }
                            } // callback
                        ); // getJson            	                    
                    } else {
                        if (!bbq.frontend.waitForTurnToast) {
                            bbq.frontend.waitForTurnToast = new bbq.frontend.GameHUD.ToastWindow("Waiting for " + whoseTurn + "'s turn!");
                        }

                        //debugger;
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
bbq.frontend.onScriptLoaded = function(callback) {
    //debugger;        	        
    boc.resources.GraphicsManager.load(bbq.assets.graphics, function () {
        //loadingWindow.remove();

        var em = boc.core.Entity_internal.em();
        var game = null;
        var gameState = null;
        var hud = new bbq.hud.HtmlHud('hud');        
        var canvas = $('canvas')[0];
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.width = bbq.frontend.width || 960;
            canvas.height = bbq.frontend.height || 640;
        }
        hud.canvas(canvas);

        boc.utils.getJson(
           'get/games',
           {
               gameid: SharedSession.user.currentGame,
           },
           function (data) {
               if (data && data.status == 'ok') {                   
                   var json = data.result[0];
                   gameState = json;

                   var game = new bbq.Game({
                       gameState: gameState,
                       canvas: canvas,
                       entityManager: em,
                       user: SharedSession.user,
                       hud: hud
                   });
                   game.victoryCondition = bbq.VictoryConditions.captureHQ;
                   game.onvictory = bbq.frontend.handleUserWin;

                   game.start();

                   SharedSession.gameObj = game;
                   //var userPlayer = boc.utils.getPlayer(SharedSession.user.playerid, em);
                   //boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
                   //boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw', forPlayer: userPlayer }), em);
                   if (SharedSession.user.playerid != game.getCurrentPlayer().id) {
                       bbq.frontend.waitForTurn();
                   }
                   if (callback) {
                       callback();
                   }
               }
           } // callback
       ); // getJson        	    
        
    });
    boc.resources.GraphicsManager.loadFiles([
        'pfx_smoke_small.png',
        'pfx_star_small.png'
    ]);
}

bbq.frontend.gameLoadScripts = function(callback) {
    // load scripts if it hasn't already been loaded
    if (!SharedSession.user.scriptsLoaded) {
        var scripts = [
            'assets/graphics.js',
            'bbq/components.js',
            'bbq/systems.js',
            'bbq/gamedata.js',
            'bbq/tiles.js',
            'bbq/ui.js',
            'bbq/game.js',
            'bbq/map.js',
            'bbq/units.js',
            'bbq/buildings.js',
            'bbq/algorithms.js',
            'bbq/commands.js',
            'bbq/unitset.js',
            'bbq/hud.js'
        ];

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
                    bbq.frontend.onScriptLoaded(callback);                    
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
        bbq.frontend.onScriptLoaded(callback);
    }
} // bbq.frontend.gameLoadScripts


// JavaScript Document
var windowsOpened = 0;
var windowStack = new Array();

function showWindow(id) {
    if (windowStack.length == 0) {
        $(".fadeBlack").fadeIn(200);
    }

    if (windowStack.length > 0) {
        $(windowStack[windowStack.length - 1]).fadeOut(200);
    }

    $(id).slideDown(200);

    windowStack.push(id);

    windowsOpened++;
    console.log(windowStack);
}

function hideWindow(totalWindows) {
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
        $(windowStack[windowStack.length - 1]).slideDown(200);
    } if (windowStack.length == 0) {
        $(".fadeBlack").fadeOut(200);
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
            src: 'mainMenu2.html', 
            onsceneload: function () {
            },
            links: [
                {
                    src: 'createAccount.html',
                    onsceneload: function () { },
                    links: []
                },
                {
                    src: 'battleMenu2.html',
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
        }; // mainMenu2.html                        
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
    //canvas.addEventListener('touchmove', function (e) {
    //    e.preventDefault();
    //    //brushMove();
    //}, false);

    //var bbq.frontend.waitForTurnToast = null,
    //    bbq.frontend.waitForTurnTid = null,
    //    bbq.frontend.waitForTurnInterval = 5000; // 5 sec

    //// checks the server every interval to see if it's user's turn
    //function bbq.frontend.waitForTurn() {
    //    if (bbq.frontend.waitForTurnTid) {
    //        clearTimeout(bbq.frontend.waitForTurnTid);
    //    }

    //    // there's a winner!
    //    if (SharedSession.gameObj.winner()) {
    //        //new bbq.frontend.GameHUD.ToastWindow('Game over! The winner is ' + SharedSession.gameObj.winner() + '!', 3000);
    //    }

    //    // no winner
    //    else {
    //        boc.utils.getJson(
    //            'get/games',
    //            { gameid: SharedSession.gameObj.id(), _fields: 'turn' },
    //            function (json) {
    //                if (json.status == 'ok') {
    //                    var whoseTurn = json.result[0].turn;
    //                    if (whoseTurn == SharedSession.user.playerid) {

    //                        if (bbq.frontend.waitForTurnToast) {
    //                            bbq.frontend.waitForTurnToast.remove();
    //                            bbq.frontend.waitForTurnToast = null;
    //                        }

    //                        boc.utils.getJson(
    //                            'get/games',
    //                            {
    //                                gameid: SharedSession.gameObj.id(),
    //                            },
    //                            function (data) {
    //                                if (data && data.status == 'ok') {
    //                                    gameState = data.result[0];
    //                                    game.load(gameState);
    //                                    new bbq.frontend.GameHUD.ToastWindow('Your turn!', 3000);
    //                                }
    //                            } // callback
    //                        ); // getJson            	                    
    //                    } else {
    //                        if (!bbq.frontend.waitForTurnToast) {
    //                            bbq.frontend.waitForTurnToast = new bbq.frontend.GameHUD.ToastWindow("Waiting for " + whoseTurn + "'s turn!");
    //                        }

    //                        //debugger;
    //                        bbq.frontend.waitForTurnTid = setTimeout(function () {
    //                            bbq.frontend.waitForTurn();
    //                        }, bbq.frontend.waitForTurnInterval); // wait for turn every 5 seconds
    //                    }
    //                } // ok
    //            }
    //        );
    //    }
    //} // bbq.frontend.waitForTurn
    
    //$(document).ready(function () {
    //    var loadingWindow = new bbq.frontend.GameHUD.ModalWindow('Loading...');
    //    loadingWindow.show($('canvas').parent(), 'loadingDiv');
    //    //boc.utils.getJson(
    //    //    'get/games',
    //    //    {
    //    //        gameid: SharedSession.user.currentGame,
    //    //    },
    //    //    function (data) {
    //    //        if (data && data.status == 'ok') {
    //    //            var json = data.result[0];
    //    //            gameState = json;
    //    //            bbq.frontend.gameContext.gameState = gameState;
    //    //            bbq.frontend.gameContext.em = em;
    //    //            bbq.frontend.gameContext.canvas = canvas;
    //    //            bbq.frontend.gameContext.handleUserWin = handleUserWin;
    //    //            if (SharedSession.user.scriptsLoaded) {
    //    //                bbq.frontend.onScriptLoaded();                            
    //    //            } // scripts loaded already
    //    //        }
    //    //    } // callback
    //    //); // getJson        	    
    //});

    //bbq.frontend.GameHUD.init(
    //    [
    //        {
    //            id: 'btnEndTurn',
    //            callback: function () {
    //                if (SharedSession.gameObj.getCurrentPlayer().id == SharedSession.user.playerid) {
    //                    new bbq.frontend.GameHUD.YesNoModalWindow(
    //                        'End your turn now?',
    //                        function () {
    //                            SharedSession.gameObj.endTurn(
    //                                function () {
    //                                    bbq.frontend.waitForTurn();
    //                                }
    //                            );
    //                        }, // yes
    //                        function () {
    //                            // do nothing
    //                        } // no
    //                    ).show();
    //                } // show only if it's the user's turn
    //            } // callback
    //        }, // endturn
    //        {
    //            id: 'btnForfeit',
    //            callback: function () {

    //                new bbq.frontend.GameHUD.YesNoModalWindow(
    //                    'Do you really want to forfeit the match?',
    //                    bbq.frontend.handleSurrender
    //                ).show();
    //            }
    //        }, // forfeit
    //        {
    //            id: 'btnMainMenu',
    //            callback: function () {
    //                document.removeEventListener('ontouchmove', bcallback);
    //                SharedSession.gameObj.stop(
    //                    function (game) {
    //                        // TODO: clear wait for turn timeout
    //                        //clearTimeout(GameMethods.bbq.frontend.waitForTurn_tid);
    //                        //GameMethods.bbq.frontend.waitForTurn_tid = null;
    //                        //GameMethods.bbq.frontend.waitForTurnToast = null;
    //                        director.pop();
    //                    }
    //                );
    //            } // callback
    //        } // mainMenu
    //    ], // menuButtonEvents
    //    {
    //        onMenuShow: function () {
    //            bbq.frontend.refreshMatches(function () {
    //                bbq.frontend.GameHUD.CurrentBattles.clear();
    //                for (var i = 0; i < SharedSession.user.activeMatches.length; i++) {
    //                    if (SharedSession.gameObj && SharedSession.gameObj.id() == SharedSession.user.activeMatches[i].gameid) {
    //                        continue;
    //                    } // don't bother showing current game

    //                    (function (match) {

    //                        var description = 'Waiting for your turn';
    //                        if (match.turn == SharedSession.user.playerid) {
    //                            description = 'Your turn!';
    //                        }
    //                        bbq.frontend.GameHUD.CurrentBattles.add(
    //                            {
    //                                avatar: match.avatar,
    //                                opponent: match.opponent,
    //                                description: description,
    //                                onclick: function () {
    //                                    //SharedSession.gameObj.stop(
    //                                    //    function (game) {
    //                                    //	    //clearTimeout(GameMethods.bbq.frontend.waitForTurn_tid);
    //                                    //	    //GameMethods.bbq.frontend.waitForTurn_tid = null;
    //                                    //	    //GameMethods.bbq.frontend.waitForTurnToast = null;
    //                                    //	    //var fakeBattlePanel = $('<div>').attr('gameid', match.gameid);
    //                                    //	    //handleBattlePanelClicked(fakeBattlePanel, 'replace');
    //                                    //    }
    //                                    //); // stop game														
    //                                } // onclick
    //                            }
    //                        ); // addBattle
    //                    })(SharedSession.user.activeMatches[i]);
    //                } // i
    //            }); // bbq.frontend.refreshMatches
    //        } // onMenuShow
    //    }, // menuShowEvents
    //    $(canvas).parent()[0]
    //);
}