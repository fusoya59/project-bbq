ns('bbq.scenes');
bbq.scenes.HtmlCreateAccount = function (id) {
    bbq.scenes.CreateAccount.call(this);
    this.id = function () {
        return id;
    };

    Recaptcha.create(
		RECAPTCHA_KEY,
		'recaptchaDiv',
		{
		    theme: 'custom',
		    custom_theme_widget: 'recaptchaCustomWidget',
		    callback: function () {
		    }
		}
	);
    var _this = this;
    $('#' + id + ' #btnBack').attr('href', '#').click(function () {
        _this.emit('back', {});
    });

    $('#' + id + ' #btnCreateAccount').click(function () {
        _this.emit('create', {});
    });
};
(function (c) {
    boc.utils.inherits(c, bbq.scenes.CreateAccount);
    c.prototype.validate = function () {
        if ($('#' + this.id() + ' input[name="create_email"]').val() == '') {
            $('#' + this.id() + ' .createAccountMessageBg').text('Email must be non-empty!').show();
            return false;
        }
        if ($('#' + this.id() + ' input[name="displayName"]').val() == '') {
            $('#' + this.id() + ' .createAccountMessageBg').text('Name must not be empty!').show();
            return false;
        }

        if ($('#' + this.id() + ' input[name="create_password"]').val() == '') {
            $('#' + this.id() + ' .createAccountMessageBg').text('Password must not be empty!').show();
            return false;
        }
        if ($('#' + this.id() + ' input[name="create_password"]').val() != $('input[name="confirm_password"]').val()) {
            $('#' + this.id() + ' .createAccountMessageBg').text('Passwords don\'t match!').show();
            return false;
        } // not same password
        return true;
    };
    c.prototype.showMessageBox = function (msg) {
        $('#' + this.id() + ' .createAccountMessageBg').text(msg).show();
    };
    c.prototype.hideMessageBox = function () {
        $('#' + this.id() + ' .createAccountMessageBg').hide();
    };
    c.prototype.reloadRecaptcha = function () {
        Recaptcha.reload();
    };
})(bbq.scenes.HtmlCreateAccount);