ns('boc.utils');

// helper class to handle events 
boc.utils.EventManager = function (obj) {
    var eventHandlers = {};
    var _this = this;
    this.notify = function (eventName, params) {
        if (eventHandlers[eventName]) {
            for (var i = 0; i < eventHandlers[eventName].length; i++) {
                eventHandlers[eventName][i](params);
            } //i
        }
    };

    this.addListener = function (eventName, callback) {
        if (!eventHandlers[eventName]) {
            eventHandlers[eventName] = [];
        }
        eventHandlers[eventName].push(callback);
    };
    this.removeListener = function (eventName, callback) {
        if (eventHandlers[eventName]) {
            if (typeof (callback) == 'undefined' || callback == null) {
                eventHandlers[eventName] = [];
            }
            else {
                var cbIndex = eventHandlers[eventName].indexOf(callback);
                if (cbIndex >= 0) {
                    eventHandlers[eventName].splice(cbIndex, 1);
                }
            }
        }
    };

    if (obj) {
        obj.addListener = this.addListener;
        obj.on = obj.addListener;
        obj.removeListener = this.removeListener;
        obj.emit = this.notify;
        obj.update = function (prop, val) {
            if (this[prop]) {
                var oldProp = this[prop];
                if (oldProp === val) { return; }
                this[prop] = val;
                _this.notify('onPropertyChange', { propertyName: prop, oldValue: oldProp, newValue: val });
            }
        }
    }
} // EventManager