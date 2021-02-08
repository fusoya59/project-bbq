ns('bbq.scenes');
bbq.scenes.HtmlFooter = function (user, id) {
    bbq.scenes.Footer.call(this, user);
    this.id = function () {
        return id;
    };
    var _this = this;
    var $surface = $('#' + id);
    $surface.find('.footerPlusLevel').click(function () {
        _this.emit('purchaseExp');
    });
    $surface.find('.footerBattleBadges .footerPlus').click(function () {
        _this.emit('purchaseTokens');
    });
    $surface.find('.footerTribeTokens .footerPlus').click(function () {
        _this.emit('purchaseBadges');
    });

    var state = 'on';
    var updateSoundInfo = function () {
        $surface.find('#soundBtn .labelSmall').text(state);
        if (state === 'on') {
            $surface.find('.soundOff').removeClass('soundOff').addClass('soundOn');
        }
        else {
            $surface.find('.soundOn').removeClass('soundOn').addClass('soundOff');
        }
    };
    this.soundState = function (onOrOff) {
        state = onOrOff;
        updateSoundInfo();
        return state;
    };
    $surface.find('#soundBtn').click(function () {
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
    this.refresh();
};
boc.utils.inherits(bbq.scenes.HtmlFooter, bbq.scenes.Footer);
bbq.scenes.HtmlFooter.prototype.refresh = function () {
    $('#' + this.id() + ' .footerLevelValue').text(this.level());
    $('#' + this.id() + ' .footerValue.footerExp').text(this.experience());
    $('#' + this.id() + ' #footerBadges').text(this.badges());
    $('#' + this.id() + ' .footerTribeTokens .footerValue').text(this.tokens());
};