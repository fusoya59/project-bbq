/// <reference path="../core/utils.js" />

ns('bbq.scenes');

(function (ns) {
    var windowsOpened = 0;
    var windowStack = new Array();

    ns.showWindow = function (id) {
        if (windowStack.length == 0) {
            $(".fadeBlack").fadeIn(200);
        }

        if (windowStack.length > 0) {
            $(windowStack[windowStack.length - 1]).fadeOut(200);
        }

        $(id).slideDown(200);

        windowStack.push(id);

        windowsOpened++;
        console.log(windowStack);
    };

    ns.hideWindow = function (totalWindows) {
        if (windowsOpened > 0) {
            windowsOpened--;
        }

        if (windowStack.length > 0) {
            $(windowStack[windowStack.length - 1]).fadeOut(200);
        }

        if (totalWindows == undefined) {
            totalWindows = 1;
        }

        if (windowStack.length == 1) {
            windowStack.pop();
        } else if (totalWindows > 0) {
            windowStack.splice(windowStack.length - totalWindows, windowStack.length);
        }

        if (windowStack.length > 0) {
            $(windowStack[windowStack.length - 1]).slideDown(200);
        } if (windowStack.length == 0) {
            $(".fadeBlack").fadeOut(200);
        }

        //console.log(windowStack);
    };
})(bbq.scenes);

bbq.scenes.Scene = function () {
    var _em = new boc.utils.EventManager(this);
};
bbq.scenes.Scene.prototype.refresh = function () { };

// events
// - newAccount
// - signIn
// - battles
// - myTribe
// - friends
// - settings
// - tutorial
// - logout
bbq.scenes.MainMenu = function () {
    bbq.scenes.Scene.call(this);
};
boc.utils.inherits(bbq.scenes.MainMenu, bbq.scenes.Scene);

(function (c) {
    c.prototype.clearSignIn = function () { };
    c.prototype.hideSignIn = function () { };
    c.prototype.showSignIn = function () { };
})(bbq.scenes.MainMenu);

// events
// - back
// - match
// - challengeDecline
// - challengeAccept
// - replayPanel
// - battlePanel
bbq.scenes.BattleMenu = function (user) {
    bbq.scenes.Scene.call(this);
};
boc.utils.inherits(bbq.scenes.BattleMenu, bbq.scenes.Scene);
bbq.scenes.BattleMenu.prototype.footer = function () {
};

// events
// - back
// - create
bbq.scenes.CreateAccount = function () {
    bbq.scenes.Scene.call(this);
};
(function (c) {
    c.prototype.validate = function () {
        return false;
    };
    c.prototype.showMessageBox = function (msg) {
    };
    c.prototype.hideMessageBox = function () {
    };
    c.prototype.reloadRecaptcha = function () {
    };
})(bbq.scenes.CreateAccount);
boc.utils.inherits(bbq.scenes.CreateAccount, bbq.scenes.Scene);

// events to implement
// - purchaseBadges
// - purchaseTokens
// - purchaseExp
bbq.scenes.Footer = function (user) {
    bbq.scenes.Scene.call(this);
    var _user = user;
    this.user = function (newUser) {
        if (typeof (newUser) != 'undefined') {
            _user = newUser;
        }
        return _user;
    };
};
boc.utils.inherits(bbq.scenes.Footer, bbq.scenes.Scene);

(function (c) {
    c.prototype.name = function () {
        return this.user().displayname;
    };
    c.prototype.experience = function () {
        return this.user().experience;
    };
    c.prototype.level = function () {
        return this.user().level;
    };
    c.prototype.badges = function () {
        return this.user().skulls;
    };
    c.prototype.tokens = function () {
        return this.user().shields;
    };
})(bbq.scenes.Footer);

// events
// - back
bbq.scenes.MyTribe = function (user) {
    bbq.scenes.Scene.call(this);
    var _user = user;
    this.user = function (newUser) {
        if (typeof (newUser) != 'undefined') {
            _user = newUser;
        }
        return _user;
    };
};
boc.utils.inherits(bbq.scenes.MyTribe, bbq.scenes.Scene);
(function (c) {
    c.prototype.footer = function () {
    };
    c.prototype.showUnitInfoWindow = function (unitType) {
    };
    c.prototype.hideUnitInfoWindow = function () {
    };
    c.prototype.showPurchaseWindow = function (unitType) {
    };
    c.prototype.hidePurchaseWindow = function () {
    };
})(bbq.scenes.MyTribe);

// events
// - back
// - add
bbq.scenes.Friends = function (user) {
    bbq.scenes.Scene.call(this);
    var _user = user;
    this.user = function (newUser) {
        if (typeof (newUser) != 'undefined') {
            _user = newUser;
        }
        return _user;
    };
};
boc.utils.inherits(bbq.scenes.Friends, bbq.scenes.Scene);
bbq.scenes.Friends.prototype.footer = function () {
};

// events
// - back
// - done
// - unitInfo
// - unit
// - loadout
bbq.scenes.TribeMemberSelect = function (user) {
    bbq.scenes.Scene.call(this);
    var _user = user;
    this.user = function (newUser) {
        if (typeof (newUser) != 'undefined') {
            _user = newUser;
        }
        return _user;
    };
};
boc.utils.inherits(bbq.scenes.TribeMemberSelect, bbq.scenes.Scene);

bbq.scenes.TribeMemberSelect.prototype.refresh = function (user) {

};
bbq.scenes.TribeMemberSelect.prototype.loadout = function (unitTypes) {

};

bbq.scenes.TribeMemberSelect.prototype.showUnitInfoWindow = function (unitType) {

};
bbq.scenes.TribeMemberSelect.prototype.footer = function () {
};

bbq.scenes.YesNoWindow = function (title, msg) {
    bbq.scenes.Scene.call(this);
};
boc.utils.inherits(bbq.scenes.YesNoWindow, bbq.scenes.Scene);


bbq.scenes.UnitInfoWindow = function (unitType) {
    bbq.scenes.Scene.call(this);
    this._unitType = unitType;
};
boc.utils.inherits(bbq.scenes.UnitInfoWindow, bbq.scenes.Scene);
bbq.scenes.UnitInfoWindow.prototype.close = function () {
};

bbq.scenes.Credits = function (id) {
    bbq.scenes.Scene.call(this);
};
boc.utils.inherits(bbq.scenes.Credits, bbq.scenes.Scene);