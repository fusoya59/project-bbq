ns('boc.core');
/**
* request animation frame convenience
* http://paulirish.com/2011/requestanimationframe-for-smart-animating/
*/
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
    function (callback) {
        var timeFrame = 1000 / 60;
        window.setTimeout(function () { callback(+new Date); }, timeFrame);
    };
})();

/**
* @constructor
* @class GameEngine 
*
* @param {object} options The speed option can be passed in.
*/
boc.core.GameEngine = function (systemsArr, options) {
    this._systems = systemsArr || [];
    this._speed = options && options.speed ? this.speed(options.speed) : 1;
    this._stop = false;
    this._stopCallback = null;
    this._paused = false;
    this._reqAnim = null;
    this._started = false;
};

/**
* Adds a system into the game.
* @param {object} system A System object.
*/
boc.core.GameEngine.prototype.addSystem = function (system) {
    this._systems.push(system);
};

/**
* Removes a system from the game.
* @param {object} system A System object.
* @returns {object} The system removed.
*/
boc.core.GameEngine.prototype.removeSystem = function (system) {
    for (var i = 0; i < this._systems.length; i++) {
        if (this._systems[i] === systems) {
            return this._systems.splice(i, 1)[0];
        }
    }
    return null;
};

// wrap this in function to privatize lastFrameTime variable
(function () {
    var lastFrameTime = 0;

    /**
    * Starts the game engine.
    */
    boc.core.GameEngine.prototype.start = function () {
        if (this._started) {
            return;
        }

        var touchCallback = function (e) {
            e.preventDefault();
        };
        document.addEventListener('touchmove', touchCallback);

        var lastFrame = window.navigator.userAgent.toLowerCase().indexOf('firefox') >= 0 ? +new Date : lastFrameTime;
        var _this = this;

        var loop = function (now) {
            if (_this._stop) {
                if (_this._stopCallback) {
                    _this._stopCallback();
                }
                if (window.cancelAnimationFrame) {
                    cancelAnimationFrame(_this._reqAnim);
                }
                lastFrameTime = lastFrame;
                return;
            }

            _this._reqAnim = requestAnimFrame(loop);
            var frameTime = (now - lastFrame) * _this._speed;

            if (!_this._paused) {
                for (var i = 0; i < _this._systems.length; i++) {
                    _this._systems[i].processTick(frameTime);
                }
            }
            lastFrame = now;
        }; // loop

        loop(lastFrame);
    };
})();

/**
* Stops the game engine completely.
* @param {function} onStop Callback invoked when stop is completed.
*/
boc.core.GameEngine.prototype.stop = function (onStop) {
    this._stopCallback = onStop;
    this._stop = true;
};

/**
* Pauses the game engine.
*/
boc.core.GameEngine.prototype.pause = function () {
    this._paused = true;
};

/**
* Resumes the game engine.
*/
boc.core.GameEngine.prototype.resume = function () {
    this._paused = false;
};

/**
* Set or get the speed of the game.
* @param {number} The speed at which the engine runs. Valid values are 0.25, 0.5, 1, 2, 4, and 8.
* @returns The speed.
*/
boc.core.GameEngine.prototype.speed = function (speed) {
    if (typeof (speed) == 'undefined') {
        return this._speed;
    }

    switch (speed) {
        case 2:
            this._speed = 2;
            break;
        case 4:
            this._speed = 4;
            break;
        case 8:
            this._speed = 8;
            break;
        case 0.5:
            this._speed = 0.5;
            break;
        case 0.25:
            this._speed = 0.25;
            break;
        default:
            this._speed = 1;
    }
    return this._speed;
};