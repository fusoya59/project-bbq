ns('bbq.scenes');
bbq.scenes.HtmlBattleMenu = function (user, id) {
    bbq.scenes.BattleMenu.call(this);
    var _user = user;
    this.user = function (newUser) {
        if (typeof (newUser) != 'undefined') {
            _user = newUser;
        }
        return _user;
    };
    this.id = function () {
        return id;
    };
    var _this = this;
    var $div = $('#'+id);
    
    // html strings from the div
    this.html = {
        findMatch: $div.find('#findMatch')[0].outerHTML,
        tutorial: $div.find('.battleButton[paneltype="tutorial"]')[0].outerHTML,
        yourTurn: $div.find('.battleButton[paneltype="yourturn"]')[0].outerHTML,
        waiting: $div.find('.battleButton[paneltype="waiting"]')[0].outerHTML,
        collectWin: $div.find('.battleButton[paneltype="collectwin"]')[0].outerHTML,
        collectLose: $div.find('.battleButton[paneltype="collectlose"]')[0].outerHTML,
        searching: $div.find('div[paneltype="searching"]')[0].outerHTML
    };
    

    $('#' + id + ' #battle_backButton').attr('href', '#').click(function () {
        _this.emit('back');
    });    

    $('#' + id + ' #refreshBtn').click(function () {
        _this.emit('refresh');
    });

    $div.find('.battleButton').remove();
    $div.find('div[paneltype="searching"]').remove();
    //$('#' + id + ' .panelFlood').empty();

    this.refresh();
};
(function (c) {
    boc.utils.inherits(c, bbq.scenes.BattleMenu);
    c.prototype.footer = function (htmlFooter) {
        if (typeof (htmlFooter) != 'undefined') {
            $('#' + this.id() + ' #footer').html(htmlFooter);
            this.footer_ = new bbq.scenes.HtmlFooter(this.user(), 'footer');
        }
        return this.footer_;
    };

    /*
	var findHtml = '<a href="#" id="battlematch"><div id="battlematch" class="findButton buttonContainer battleContainer"><div class="btnBattlePosition"> <div class="button btnFindBattle"> <div class="content"><div class="button btn35x35"><div class="content"><img class="cross" /></div></div></div><div class="content"> <span class="labelLarge">Find a Match</span></div></div></div></div></a>';
    var matchingHtml = '<div class="buttonContainer battleContainer"> <div class="btnBattlePosition"> <div class="button btnFindBattle"> <div class="content"> <img class="magnify" /> </div> <div class="content"> <span class="labelLarge">Searching...</span> </div> </div> </div> </div>';
	
	
    var yourTurnHtml = '<div class="battlePanel buttonContainer battleContainer"> <div class="battleStatusRight">Your Turn!</div> <div class="btnBattlePosition"> <div class="button buttonBlue btnBattle"> <img class="check" /> <span class="battleName labelLarge">$opponent</span> </div> </div> </div>';
    var oppTurnHtml = '<div class="battlePanel buttonContainer battleContainer"> <div class="battleStatusLeft">Waiting...</div> <div class="btnBattlePosition"> <div class="button buttonYellow btnBattle"> <img class="clock" /> <span class="battleName labelLarge">$opponent</span> </div> </div> </div>';
    var retiredHtml = '<div class="battlePanel btnBattle btnBattleMargin replayPanel"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleFinishedImage"><div class="btnBattleContent"><div class="btnBattleUsername">$opponent</div><div class="btnBattleMap">$mapid</div><div class="btnBattleResult btnBattleVictory"></div></div></div></div>';
    var challengeReplyHtml = '<div class="battlePanel btnBattle btnBattleMargin"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleYourTurnImage"><div class="btnBattleContent"><div class="btnBattleUsername" style="text-align:right">$friendName</div><div class="btnBattleMap">has challenged you!</div><div style="margin-top:35px"><div index="$i" class="btnAccept" style="margin-left:5px" ></div><div index="$i" class="btnDecline" ></div></div></div></div></div>';
    var challengeRequestHtml = '<div class="battlePanel btnBattle btnBattleMargin"><div class="btnBattleChiefImage iconPlaceholder"></div><div class="btnBattleBg btnBattleWaitingImage"><div class="btnBattleContent"><div class="btnBattleMap">Challenging</div><div class="btnBattleUsername" style="text-align:right">$friendName</div><div class="btnBattleMap">Awaiting reply</div></div></div></div>';
    var winLoseHtml =  '<div class="battlePanel buttonContainer battleContainer"> <div class="battleStatusRight">Collect</div> <div class="btnBattlePosition"> <div class="button buttonBlue btnBattle"> <img class="$winlose" /> <span class="battleName labelLarge">$opponent</span> </div> </div> </div>';
    */

    c.prototype.refresh = function (userObj) {
        var _this = this;
        if (this.footer_) {
            if (userObj) {
                this.footer_.user(userObj);
            }
            this.footer_.refresh();
        }
        if (userObj) {
            this.user(userObj);
        }
        //$('#' + _this.id() + ' .panelFlood').empty();

        /*
        for (var i = 0; i < _this.user().pendingChallengeReplies.length; i++) {
            var match = _this.user().pendingChallengeReplies[i];
            $(challengeReplyHtml.replace(/\$friendName/g, match.opponent).replace(/\$i/g, i))
                .addClass('challengeReply')
                .appendTo($('#currentBattles'));
        }

        for (var i = 0; i < _this.user().pendingChallengeRequests.length; i++) {
            var match = _this.user().pendingChallengeRequests[i];
            $(challengeRequestHtml.replace(/\$friendName/g, match.opponent).replace(/\$i/g, i))
                .appendTo($('#currentBattles'));
        }
        */

        // add a tutorial panel if this guy hasn't done it yet
        //if (!_this.user().tutorialComplete) {
        //    $(_this.html.tutorial)
        //        .attr('matchid', 'tutorial')
        //        .appendTo($('#currentBattles'));
        //}
		
		//if (_this.user().pendingMatches.length > 0) {
		//	console.log(_this.user().pendingMatches.length);
		//	console.log($('#' + this.id()).find('#findMatch'));
		//	$('#' + this.id()).find('#findMatch').remove();
		//}
		
		$('#' + this.id()).find('.battleButton').remove();
		$('#' + this.id()).find('div[paneltype="searching"]').remove();

		$('#' + this.id()).find('#findMatch').remove();
		$(this.html.findMatch).prependTo($('#currentBattles'));
		$('#' + this.id() + ' #findMatch').click(function () {
		    _this.emit('match');
		});
		
        var notYourTurn = []
        for (var i = 0; i < _this.user().activeMatches.length; i++) {
            var match = _this.user().activeMatches[i];
            if (match.winner) { // theres a winner
                var youWin = _this.user().playerid == match.winner; //? 'win' : 'lose';
                if (youWin) {
                    $(_this.html.collectWin.replace('$mapid', match.mapid).replace('$opponent', match.opponent))
                        .attr('matchid', match.matchid)
                        .attr('gameid', match.gameid)
                        .attr('winner', match.winner)
                        .appendTo($('#currentBattles'));
                }
                else {
                    $(_this.html.collectLose.replace('$mapid', match.mapid).replace('$opponent', match.opponent))
                        .attr('matchid', match.matchid)
                        .attr('gameid', match.gameid)
                        .attr('winner', match.winner)
                        .appendTo($('#currentBattles'));
                }                
			}
            else if (match.turn == _this.user().playerid) { // my turn, but no winner yet
                $(_this.html.yourTurn.replace('$mapid', match.mapid).replace('$opponent', match.opponent))
                    .attr('matchid', match.matchid)
                    .attr('gameid', match.gameid)
                    .appendTo($('#currentBattles'));
            }
            else { // not my turn
                notYourTurn.push(match);
            }
        }
        notYourTurn.reverse();
        while (notYourTurn.length > 0) {
            var match = notYourTurn.pop();
            if (match.winner) {                
                var youWin = _this.user().playerid == match.winner; //? 'win' : 'lose';
                if (youWin) {
                    $(_this.html.collectWin.replace('$mapid', match.mapid).replace('$opponent', match.opponent))
                        .attr('matchid', match.matchid)
                        .attr('gameid', match.gameid)
                        .attr('winner', match.winner)
                        .appendTo($('#currentBattles'));
                }
                else {
                    $(_this.html.collectLose.replace('$mapid', match.mapid).replace('$opponent', match.opponent))
                        .attr('matchid', match.matchid)
                        .attr('gameid', match.gameid)
                        .attr('winner', match.winner)
                        .appendTo($('#currentBattles'));
                }
            }
            else {
                $(_this.html.waiting.replace('$mapid', match.mapid).replace('$opponent', match.opponent))
                    .attr('matchid', match.matchid)
                    .attr('gameid', match.gameid)
                    .appendTo($('#currentBattles'));
            }
        }//while

        //for (var i = 0; i < _this.user().retiredMatches.length; i++) {
        //    var match = _this.user().retiredMatches[i];
        //    $(retiredHtml.replace('$mapid', match.mapid).replace('$opponent', match.opponent))
        //        .attr('matchid', match.matchid)
        //        .attr('gameid', match.gameid)
        //        .appendTo($('#finishedBattles'));
        //}

		// add matchButton
		//if (_this.user().pendingMatches.length == 0) {
		//	$(findHtml)
		//		.addClass('findButton')
		//		.appendTo($('#currentBattles'));
		//}

        
        if (_this.user().pendingMatches.length) {
            $('#' + this.id() + ' #findMatch').remove();
            for (var i = 0; i < _this.user().pendingMatches.length; i++) {
                var match = _this.user().pendingMatches[i];
                $(this.html.searching)
                    .addClass('searching')
                    .attr('matchid', match.matchid)
                    .prependTo($('#currentBattles'));
            }
        }                

        // arm events
        
        //$('#' + _this.id() + ' .challengeReply .btnDecline').click(function () {
        //    _this.emit('challengeDecline', { element: this });
        //});

        //$('#' + _this.id() + ' .challengeReply .btnAccept').click(function () {
        //    _this.emit('challengeAccept', { element: this });
        //});

        $('#' + _this.id() + ' .battleButton').click(function () {	        
            _this.emit('battlePanel', { element: this });
        });

        //$('#' + _this.id() + ' .replayPanel').click(function () {
        //    _this.emit('replayPanel', { element: this });
        //});
    };
})(bbq.scenes.HtmlBattleMenu);