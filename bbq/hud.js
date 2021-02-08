/// <reference path="../core/utils.js" />
/// <reference path="unitset.js" />
/// <reference path="../core/resources.js" />

var bbq = bbq || {};
bbq.hud = bbq.hud || {};

// events to implement
// - spellbook
// - pause
// - endturn
// - info
// - trainok
// - trainback
// - traininfo
// - trainselect
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
    hud.prototype.canvas = function (newCanvas) { };
    hud.prototype.clear = function () { };
})(bbq.hud.IHud);

bbq.hud.HtmlHud = function (id) {
    bbq.hud.IHud.call(this);

    this.id = function () {
        return id;
    };

    var _this = this;
    var $hud = $('#' + id);
    
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
    $hud.find('.btnEndTurn').click(function () {
        _this.emit('endturn', {});
    });
    $hud.find('.trainButton').click(function () {
        _this.emit('trainok', {});
    });
    $hud.find('.windowBack').click(function () {
        $hud.find('.btnUnit').remove();
        $hud.find('.myTribeWindow').hide();
        _this.emit('trainback', {});
    });
        
    // TODO: traininfo
    // TODO: trainselect
};
boc.utils.inherits(bbq.hud.HtmlHud, bbq.hud.IHud);

(function (hud) {
    var unitBtnHtml = '<div class="btnUnit">' +
        '<div class="btnUnitHitbox">' +
        '<div class="btnSquareIcon iconPlaceholder"></div>' +
        '<div class="btnSquareBorder imageSquareUnlocked buttonSprite_hover"></div>' +
        '<div class="btnSquarePriceBg">' +
        '<div class="btnSquarePriceIcon iconBattleBadgeSmall btnUnitPriceFood "></div>' +
        '<div class="btnSquarePriceValue">$(foodCost)</div>' +
        '</div>' +
        '</div>' +
        '<div class="btnSquareLabel">$(displayName)</div>' +
        '<div class="btnSquareInfo buttonSprite_hover"></div>' +
        '</div>';

    hud.prototype.food = function (newFood) {
        if (typeof (newFood) == 'undefined') {
            return $('#' + this.id() + ' .foodValue').text();
        }        
        $('#' + this.id() + ' .foodValue').text(newFood);
        return this;
    };
    hud.prototype.name = function (newName) {
        if (typeof (newName) == 'undefined') {
            return $('#' + this.id() + ' .unitName').text();
        }
        $('#' + this.id() + ' .unitName').text(newName);
        return this;
    };
    hud.prototype.health = function (newHealth) {
        if (typeof (newHealth) == 'undefined') {
            return $('#' + this.id() + ' .unitInfoStatHealth .unitInfoStatValue').text();
        }
        $('#' + this.id() + ' .unitInfoStatHealth .unitInfoStatValue').text(newHealth);
        return this;
    };
    hud.prototype.attack = function (newAttack) {
        if (typeof (newAttack) == 'undefined') {
            return $('#' + this.id() + ' .unitInfoStatAttack .unitInfoStatValue').text();
        }
        $('#' + this.id() + ' .unitInfoStatAttack .unitInfoStatValue').text(newAttack);
        return this;
    };
    hud.prototype.range = function (newRange) {
        if (typeof (newRange) == 'undefined') {
            return $('#' + this.id() + ' .unitInfoStatRange .unitInfoStatValue').text();
        }
        $('#' + this.id() + ' .unitInfoStatRange .unitInfoStatValue').text(newRange);
        return this;
    };
    hud.prototype.movement = function (newMovement) {
        if (typeof (newMovement) == 'undefined') {
            return $('#' + this.id() + ' .unitInfoStatMovement .unitInfoStatValue').text();
        }
        $('#' + this.id() + ' .unitInfoStatMovement .unitInfoStatValue').text(newMovement);
        return this;
    };
    hud.prototype.vision = function (newVision) {
        if (typeof (newVision) == 'undefined') {
            return $('#' + this.id() + ' .unitInfoStatVision .unitInfoStatValue').text();
        }
        $('#' + this.id() + ' .unitInfoStatVision .unitInfoStatValue').text(newVision);
        return this;
    };

    hud.prototype.openTrainWindow = function (unitSet) {
        $('#' + this.id() + ' .windowUniversalContents.scrollX.skinnedScrollbar').empty();
        $('#' + this.id() + ' .myTribeWindow').show();
        var _this = this;
        for (var i = 0; i < unitSet.length; i++) {
            (function (_i) {
                var btnHtml = unitBtnHtml
                            .replace(/\$\(displayName\)/g, unitSet.info(_i).displayName)
                            .replace(/\$\(foodCost\)/g, unitSet.info(_i).foodCost);
                var $unitBtn = $(btnHtml);

                var $img = $unitBtn.find('.iconPlaceholder').html(boc.resources.GraphicsManager.getImage(unitSet.info(_i).defaultImagePath)).find('img');
                $img.attr('width', 100).attr('height', 100);
                $('#' + _this.id() + ' .windowUniversalContents.scrollX.skinnedScrollbar').append($unitBtn);
                if (_i == 0) {
                    $unitBtn.addClass('btnUnitFirst');
                } else if (_i == unitSet.length - 1) {
                    $unitBtn.addClass('btnUnitLast');
                }

                $unitBtn.click(function () {
                    //debugger;
                    $('#' + _this.id() + ' .imageSquareSelected')
                        .removeClass('imageSquareSelected')
                        .addClass('imageSquareUnlocked');
                    $unitBtn.find('.imageSquareUnlocked')
                        .removeClass('imageSquareUnlocked')
                        .addClass('imageSquareSelected');
                    unitSet.select(_i);
                    
                });
            })(i);            
        }        
    };

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
})(bbq.hud.HtmlHud);

