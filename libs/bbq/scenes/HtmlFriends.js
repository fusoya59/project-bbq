ns('bbq.scenes');
bbq.scenes.HtmlFriends = function (user, id) {
    bbq.scenes.Friends.call(this, user);
    this.id = function () { return id; }
    var _this = this;
    $('#' + id + ' a[href="mainMenu2.html"]').attr('href', '#').click(function () {
        _this.emit('back');
    });
    $('#' + id + '#btnAddFriend').click(function () {
        _this.emit('add');
    });
};
boc.utils.inherits(bbq.scenes.HtmlFriends, bbq.scenes.Friends);
(function (c) {

    c.prototype.footer = function (htmlFooter) {
        if (typeof (htmlFooter) != 'undefined') {
            $('#' + this.id() + ' #footer').html(htmlFooter);
            this.footer_ = new bbq.scenes.HtmlFooter(this.user(), this.id() + ' #footer');
        }
        return this.footer_;
    };
    c.prototype.refresh = function () {
        if (this.footer_) {
            this.footer_.refresh();
        }
        // TODO: refresh code here
    };
})(bbq.scenes.HtmlFriends);