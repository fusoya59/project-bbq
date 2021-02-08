ns('bbq.scenes');
bbq.scenes.HtmlCredits = function (id) {
    bbq.scenes.Friends.call(this, id);
    this.id = function () { return id; }
    var _this = this;
    
    var $surface = $('#' + id);

    $surface.find('#battle_backButton').attr('href', '#').click(function () {
        _this.emit('back');
    });

    var state = 'on';
    this.soundState = function (onOrOff) {
        state = onOrOff;
        updateSoundInfo();
        return state;
    };
    var updateSoundInfo = function () {
        $surface.find('.soundBtn .labelSmall').text(state);
        if (state === 'on') {
            $surface.find('.soundOff').removeClass('soundOff').addClass('soundOn');
        }
        else {
            $surface.find('.soundOn').removeClass('soundOn').addClass('soundOff');
        }
    };
    $surface.find('.soundBtn').click(function () {
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
};
boc.utils.inherits(bbq.scenes.HtmlCredits, bbq.scenes.Credits);