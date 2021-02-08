if (!window.bbq) { window.bbq = {} }
bbq.Session = function () {
    boc.utils.EventEmitter.call(this);
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

	var _this = this;
	var _settings = { sound: 'on' };
	this.settings = function (name, value) {
	    if (arguments.length === 1) {
	        return _settings[name];
	    }
	    else {
	        var old = _settings[name];
	        _settings[name] = value;
	        _this.emit('settingsChanged', { name: name, oldValue: old, newValue: value });
	    }
	};
} // Session
boc.utils.inherits(bbq.Session, boc.utils.EventEmitter);
var SharedSession = new bbq.Session();