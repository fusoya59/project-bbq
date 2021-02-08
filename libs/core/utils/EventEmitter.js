ns('boc.utils');

boc.utils.EventEmitter = function () {
    this._listeners = {}; // event name -> array of callbacks
};

boc.utils.EventEmitter.prototype.on = function (eventName, callback) {
    if (!this._listeners[eventName]) {
        this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(callback);
};

boc.utils.EventEmitter.prototype.addListener = boc.utils.EventEmitter.prototype.on;

boc.utils.EventEmitter.prototype.removeListener = function (eventName, callback) {
    var listeners = this._listeners[eventName];
    if (!listeners) {
        return;
    }
    for (var i = 0; i < listeners.length; i++) {
        if (listeners[i] === callback) {
            listeners.splice(i, 1);
            return;
        }
    }
};

boc.utils.EventEmitter.prototype.emit = function (eventName, args) {
    var listeners = this._listeners[eventName];
    if (!listeners) {
        return;
    }
    for (var i = 0; i < listeners.length; i++) {
        listeners[i](args);
    }
};

boc.utils.EventEmitter.prototype.notify = boc.utils.EventEmitter.prototype.emit;