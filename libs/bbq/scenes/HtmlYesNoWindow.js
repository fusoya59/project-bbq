ns('bbq.scenes');
bbq.scenes.HtmlYesNoWindow = function (title, msg, id) {
    bbq.scenes.YesNoWindow.call(this, title, msg);
    var _this = this;
    $('#' + id + ' #yesbtn').click(function () {
        _this.emit('yes');
    });
    $('#' + id + ' #nobtn').click(function () {
        _this.emit('no');
    });
    $('#' + id + ' #close').click(function () {
        _this.emit('no');
    });
    $('#' + id + ' #title h1').text(title);
    $('#' + id + ' #message').text(msg);
};
boc.utils.inherits(bbq.scenes.HtmlYesNoWindow, bbq.scenes.YesNoWindow);