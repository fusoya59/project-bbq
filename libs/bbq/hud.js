/// <reference path="../core/utils.js" />
/// <reference path="unitset.js" />
/// <reference path="../core/resources.js" />
ns('bbq.hud');

// events to implement
// - spellbook
// - pause
// - endturn
// - info
// - trainok
// - trainback
// - traininfo
// - trainselect
// - open
// - menuresume
// - menuforfeit
// - menubattles
// - summarycollect
// - sound
bbq.hud.IHud = function () {
    var _em = new boc.utils.EventManager(this);
};

(function (hud) {
    hud.prototype.food = function (newFood) { };
    hud.prototype.name = function (newName) { };
    hud.prototype.health = function (newHealth) { };
    hud.prototype.attack = function (newAttack) { };
    hud.prototype.range = function (newRange) { };
    hud.prototype.movement = function (newMovement) { };
    hud.prototype.vision = function (newVision) { };    
    hud.prototype.openTrainWindow = function (trainableUnits) { };
    hud.prototype.closeTrainWindow = function () { };
    hud.prototype.openSummaryWindow = function () { };
    hud.prototype.closeSummaryWindow = function () { };
    hud.prototype.openMenuWindow = function () { };
    hud.prototype.closeMenuWindow = function () { };
    hud.prototype.canvas = function (newCanvas) { };
    hud.prototype.clear = function () { };
    hud.prototype.summary = function() {};
})(bbq.hud.IHud);

bbq.hud.HtmlHud = function (id) {
    bbq.hud.IHud.call(this);

    this.id = function () {
        return id;
    };

    var _this = this;
    var $hud = $('#' + id);
    //console.log(id);
    //console.log($hud);
    $hud.find('.myTribeWindow').hide();

    // setup events
    $hud.find('.smallInfoButton').click(function () {
        _this.emit('info', {});
    });
    $hud.find('.btnSpellbook').click(function () {
        _this.emit('spellbook', {});
    });
    $hud.find('.btnPause').click(function () {
        _this.emit('pause', {});
    });
    $hud.find('#btnEndTurn').click(function () {
        _this.emit('endturn', {});
    });
    $hud.find('.trainButton').click(function () {
        _this.emit('trainok', { selected : _this._selected });
    });
    $hud.find('#closeTrainWindow').click(function () {
        _this.closeTrainWindow();
    });
    
    $hud.find('.pauseMenu #menuResume').click(function() {
    	_this.emit('menuresume', _this);
    });
    
    $hud.find('.pauseMenu #menuForfeit').click(function() {
    	_this.emit('menuforfeit', _this)
    });
    
    $hud.find('.pauseMenu #menuBattles').click(function() {
    	_this.emit('menubattles', _this)
    });
    
    $hud.find('#summaryCollect').click(function() {
    	_this.emit('summarycollect', _this)
    });

    var state = 'on';
    this.soundState = function (onOrOff) {
        state = onOrOff;
        updateSoundInfo();
        return state;
    };
    var updateSoundInfo = function () {
        $hud.find('.soundBtn .labelSmall').text(state);
        if (state === 'on') {
            $hud.find('.soundOff').removeClass('soundOff').addClass('soundOn');
        }
        else {
            $hud.find('.soundOn').removeClass('soundOn').addClass('soundOff');
        }
    };
    $hud.find('.soundBtn').click(function () {
        if (state === 'on') {
            state = 'off';
        }
        else {
            state = 'on';
        }
        updateSoundInfo();
        _this.emit('sound', state);
    });
    updateSoundInfo();
    // TODO: traininfo
    // TODO: trainselect
};
boc.utils.inherits(bbq.hud.HtmlHud, bbq.hud.IHud);

(function (hud) {
    var unitBtnHtml = '<div class="unitContainer"> <div class="unitBg"> <img class="unitImage" /> <div class="unitPriceBg"> <div class="vAlign"> <img class="unitPriceIcon iconFoodSmall" /></div><div class="vAlign"> <span class="unitPriceValue">$foodCost</span></div></div></div></div>';

    hud.prototype.food = function (newFood) {
        if (typeof (newFood) == 'undefined') {
            return $('#foodValue').text();
        }
		
		
		var oldFood = Number($('#' + this.id() + ' #foodValue').text());
		
		if (oldFood == null || oldFood == undefined) {
			$('#foodValue').text(newFood).css('z-index', 100);
			return;
		}
		
		var duration = 500;
		
		$({someValue: oldFood}).animate({someValue: newFood}, {
			duration: duration,
			easing: 'linear', // can be anything
			step: function() { // called on every step
				// Update the element's text with rounded-up value:
		        $('#foodValue').text(Math.ceil(this.someValue)).css('z-index', 100);
			},
			complete: function() {
		        $('#foodValue').text(newFood).css('z-index', 100);
			}
		});
		
        return this;
    };
    hud.prototype.name = function (newName) {
        if (typeof (newName) == 'undefined') {
            return $('#' + this.id() + ' #unitName').text();
        }
        $('#' + this.id() + ' #unitName').text(newName).css('z-index', 100);
        return this;
    };
    hud.prototype.health = function (newHealth) {
        if (typeof (newHealth) == 'undefined') {
            return $('#' + this.id() + ' #unitHealth').text();
        }
        $('#' + this.id() + ' #unitHealth').text(newHealth).css('z-index', 100);
        return this;
    };
    hud.prototype.attack = function (newAttack) {
        if (typeof (newAttack) == 'undefined') {
            return $('#' + this.id() + ' #unitAttack').text();
        }
        $('#' + this.id() + ' #unitAttack').text(newAttack).css('z-index', 100);
        return this;
    };
    hud.prototype.range = function (newRange) {
        if (typeof (newRange) == 'undefined') {
            return $('#' + this.id() + ' #unitRange').text();
        }
        $('#' + this.id() + ' #unitRange').text(newRange).css('z-index', 100);
        return this;
    };
    hud.prototype.movement = function (newMovement) {
        if (typeof (newMovement) == 'undefined') {
            return $('#' + this.id() + ' #unitMovement').text();
        }
        $('#' + this.id() + ' #unitMovement').text(newMovement).css('z-index', 100);
        return this;
    };
    hud.prototype.vision = function (newVision) {
        if (typeof (newVision) == 'undefined') {
            return $('#' + this.id() + ' #unitVision').text();
        }
        $('#' + this.id() + ' #unitVision').text(newVision).css('z-index', 100);
        return this;
    };

    hud.prototype.openTrainWindow = function (unitSet) {
        $('#' + this.id() + ' #trainUnitContainer').empty();
        
		$trainWindow = $('#' + this.id() + ' #trainWindow');
		var docElem = document.documentElement;
		var centerTop = (docElem.clientHeight - $trainWindow.outerHeight()) / 2;
		
		$trainWindow.css('top', centerTop);
		
		$('#' + this.id() + ' #trainWindow').show();
        var _this = this;
        for (var i = 0; i < unitSet.length; i++) {
            (function (_i) {
                var btnHtml = unitBtnHtml.replace(/\$foodCost/g, unitSet.info(_i).foodCost);
                var $unitBtn = $(btnHtml);
                var imgpath = unitSet.info(_i).defaultImagePath || (unitSet[_i] + '_' + unitSet.team().toLowerCase());
                console.log(unitSet.info(_i));
                
                var $img = $unitBtn.find('.unitBg').find('img.unitImage').attr('src', $(boc.resources.GraphicsManager.getImage(imgpath)).attr('src'));
                $img.attr('width', 100).attr('height', 100);
                $('#' + _this.id() + ' #trainUnitContainer').append($unitBtn);
				/*
                if (_i == 0) {
                    $unitBtn.addClass('btnUnitFirst');
                } else if (_i == unitSet.length - 1) {
                    $unitBtn.addClass('btnUnitLast');
                }
                $unitBtn.find('.btnSquareInfo').click(function () {
                    var $infoWindow = $('<div>').attr('id','hudUnitInfoWindow').append($(bbq.UiCache['ui/unitInfoWindow.html']));
                    $('#' + _this.id()).append($infoWindow);
                    new bbq.scenes.HtmlUnitInfoWindow(unitSet[_i], $infoWindow.attr('id'));
                });
				*/
                $unitBtn.click(function () {
                    //debugger;
                    /*
					$('#' + _this.id() + ' .imageSquareSelected')
                        .removeClass('imageSquareSelected')
                        .addClass('imageSquareUnlocked');
                    $unitBtn.find('.imageSquareUnlocked')
                        .removeClass('imageSquareUnlocked')
                        .addClass('imageSquareSelected');
                    unitSet.select(_i);
                    */
					var infoHtml = '<div class="unitInfo center"> <div class="unitNameBg"> <span>$displayName</span> </div> <!-- unitNameBg --> <div class="unitDesc"> $description </div> <!-- unitDesc --> <div class="unitPriceBg"> <div class="vAlign"> <div class="trainButton center buttonContainer button buttonBlue"> <div class="content"> <span class="labelLarge btnWord"> Train </span> </div> <!-- content --> </div> <!-- buttonContainer --> </div> <!-- vAlign --> </div> <!-- unitPriceBg --> </div> <!-- unitInfo -->'.replace(/\$displayName/g, unitSet.info(_i).displayName).replace(/\$description/g, unitSet.info(_i).description);
					
					
					$('#' + _this.id() + ' .unitContainerExpand').removeClass('unitContainerExpand');
					$('#' + _this.id() + ' .unitInfo').remove();
					
					var $infoHtml = $(infoHtml);
					$infoHtml.prependTo($unitBtn);
					
					$unitBtn.addClass('unitContainerExpand');
                    unitSet.select(_i);
					_this._selected = unitSet[unitSet.selected()];
					
					$infoHtml.find(".trainButton").click(function() {
				        _this.emit('trainok', { selected : _this._selected });
					});
					
					_this.emit('updateStats', {unitInfo : unitSet.info(_i)});
					// arm train button
                });
            })(i);            
        }
		
		//bbq.sh().play(bbq.sh().getAudio('weaponWindup'));
		
        this.emit('open', this);
    };

    hud.prototype.closeTrainWindow = function (o) {
        var $hud = $('#' + this.id());
        $hud.find('.btnUnit').remove();
        $hud.find('#trainWindow').hide();
        this._selected = null;
        this.emit('trainback', o);
    }; // closeTrainWindow

    hud.prototype.canvas = function (newCanvas) {
        if (typeof (newCanvas) == 'undefined') {
            return $('#' + this.id() + ' .hud canvas')[0];
        }
        $('#' + this.id() + ' .hud canvas').remove();
        $('#' + this.id() + ' .hud').prepend(newCanvas);
        return this;
    };

    hud.prototype.clear = function () {
        this.attack('');
        this.food('');
        this.health('');
        this.movement('');
        this.name('');
        this.range('');
        this.vision('');
    };
	
	hud.prototype.hideUnitStats = function () {
		$('#unitStats').removeClass('unitStatsShow');
		$('#unitStats').addClass('unitStatsHide');
	}
	
	hud.prototype.showUnitStats = function () {
		$('#unitStats').removeClass('unitStatsHide');
		$('#unitStats').addClass('unitStatsShow');
	}
	
	hud.prototype.openMenuWindow = function() {
	    var $pause = $('.pauseMenuContainer').css('z-index', 1000);
	    $('#' + this.id()).append($pause);
		//$(document.body).append($pause);
		$pause.show();
	};
	
	hud.prototype.closeMenuWindow = function() {
		$('.pauseMenuContainer').hide();
	};
	
	hud.prototype.openSummaryWindow = function(title) {
		title = title || 'Summary';
		$('#summaryTitle').text(title);
		$('#summaryWindow').show();
	};
	
	hud.prototype.closeSummaryWindow = function() {
		$('.summaryWindow').hide();
	};
	
	hud.prototype.summary = function(summaryObj, turns, avgTurns, reward) {
		/*
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
        ]*/
       $('#summaryRow1Column2Value').text(summaryObj.unitsKilled);
       $('#summaryRow1Column3Value').text(summaryObj.unitsLost);
       
       $('#summaryRow2Column2Value').text(summaryObj.buildingsCaptured);
       $('#summaryRow2Column3Value').text('0');
       
       $('#summaryRow3Column2Value').text(summaryObj.foodCollected);
       $('#summaryRow3Column3Value').text(summaryObj.foodConsumed);
       
       $('#summaryRow4Column2Value').text(turns);
       $('#summaryRow4Column3Value').text(avgTurns);       
       
       $('#summaryRewardValue').text(reward);
	};	
	
})(bbq.hud.HtmlHud);

