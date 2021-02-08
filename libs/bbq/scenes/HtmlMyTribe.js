ns('bbq.scenes');
bbq.scenes.HtmlMyTribe = function (user, id) {
    bbq.scenes.MyTribe.call(this, user);
    this.id = function () { return id; }
    var _this = this;
    $('#' + id + ' a[href="mainMenu2.html"]').attr('href', '#').click(function () {
        _this.emit('back');
    });
    $('#' + id + ' .btnSquareInfo').click(function () {
        _this.showUnitInfoWindow($(this).attr('unitType'));
    });
    $('#' + id + ' #unitInfoClose').click(function () {
        _this.hideUnitInfoWindow();
    });
};
boc.utils.inherits(bbq.scenes.HtmlMyTribe, bbq.scenes.MyTribe);
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
    c.prototype.showUnitInfoWindow = function (unitType) {
        bbq.scenes.showWindow('#unitInfoWindow');
    };
    c.prototype.hideUnitInfoWindow = function () {
        bbq.scenes.hideWindow('#unitInfoWindow');
    };
    c.prototype.showPurchaseWindow = function (unitType) {
    };
    c.prototype.hidePurchaseWindow = function () {
    };
})(bbq.scenes.HtmlMyTribe);