ns('bbq.scenes');
bbq.scenes.HtmlMainMenu = function (id) {
    bbq.scenes.MainMenu.call(this);
    this.id = function () {
        return id;
    };

    var _this = this;
    $('#' + id + ' a[href="createAccount.html"]').attr('href', '#').click(function () {
        _this.emit('newAccount', {});
    });

    $('#' + id + ' #btnSignIn').click(function () {
		_this.emit('signIn', { element: this });
    });

    $('#' + id + ' #btnPlay').click(function () {
        _this.emit('battles', { element: this });
    });

    $('#' + id + ' a[href="myTribe.html"]').attr('href', '#').click(function () {
        _this.emit('myTribe', { element: this });
    });

    $('#' + id + ' a[href="friends.html"]').attr('href', '#').click(function () {
        _this.emit('friends', { element: this });
    });

    $('#' + id + ' #btnLogOut').click(function () {
        _this.emit('logout', { element: this });
    });

    $('#' + id + ' #btnTutorial').click(function () {
        _this.emit('tutorial', { element: this });
    });

    $('#' + id + ' .creditsBtn').click(function () {
        _this.emit('credits', { element: this });
    });

    var $surface = $('#' + id);
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

(function (c) {
    boc.utils.inherits(c, bbq.scenes.MainMenu);
    c.prototype.clearSignIn = function () {
        $('#' + this.id() + ' input[name="username"]').val('');
        $('#' + this.id() + ' input[name="password"]').val('');
    };
    c.prototype.hideSignIn = function () {
        $('#' + this.id() + ' .signInWindow').hide();
		$('#' + this.id() + ' .btnPlay').show();
		
    };
    c.prototype.showSignIn = function () {
        $('#' + this.id() + ' .signInWindow').show();
		$('#' + this.id() + ' .btnPlay').hide();
    };
})(bbq.scenes.HtmlMainMenu);