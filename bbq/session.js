if (!window.bbq) { window.bbq = {} }
bbq.Session = function () {
    var _this = this;
	this.user = null;
	this.gameObj = null;
	this.refreshUser = function (onFinish) {
	    boc.utils.getJson('userinfo', {}, function (json) {
	        //debugger;
	        _this.user = new bbq.User(json.result);
	        if (onFinish) { onFinish(_this.user); }
	    });
	}
} // Session

var SharedSession = new bbq.Session();