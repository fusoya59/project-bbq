/// <reference path="../bbq/session.js" /
/// <reference path="../core/utils.js" /
/// <reference path="../core/constants.js" /
/// <reference path="../core/socket.io-client-min.js" /

// TurnClient
// ----------
// this class connects to the server via socket.
// if it's the user's turn, it will receive a message saying that it's his/her turn


var bbq = bbq || {};

(function () {
    // events emitted
    // - connect
    // - your turn (gameObject)
    // - turn request ended (reason)
    // - disconnect
    bbq.TurnClient = function (sessionKey, options) {
        if (!options) {
            options = {};
        }
        if (!options.host) {
            options.host = boc.constants.API_HOST;
        }

        // private 
        this.eventManager_ = new boc.utils.EventManager(this);
        this.socket_ = null;

        // public
        this.sessionKey = sessionKey;
        this.serverHost = options.host;
        this.connected = false;
    };

    var c = bbq.TurnClient;

    c.prototype.connect = function () {
        var _this = this;
        io.transports =
            [
                'xhr-polling',
                'jsonp-polling'
            ];
        var socket = io.connect(this.serverHost, { 'force new connection': true });
        this.socket_ = socket;        
        socket.on('challenge request', function () {
            console.log('challenge requested');
            socket.emit('challenge response', { origin: location.origin, boc_session: _this.sessionKey });
        });
        socket.on('challenge accepted', function (user) {
            console.log('challenge accepted', user);
            _this.connected = true;
            _this.emit('connect');
        });

        socket.on('challenge rejected', function () {
            console.log('challenge rejected');
            socket.disconnect();
        });
        socket.on('your turn', function (gameid) {
            console.log('my turn for game id', gameid);
            _this.emit('your turn', gameid);
        });
        socket.on('turn request ended', function (reason) {
            console.log('turn request ended', reason);
            _this.emit('turn request ended', reason);
        });
    };

    c.prototype.disconnect = function () {
        var _this = this;
        this.socket_.disconnect();
        _this.connected = false;
        _this.emit('disconnect');
        //this.socket_.on('disconnect', function () {
        //    _this.connected = false;
        //    _this.emit('disconnect');
        //});
    };

    c.prototype.wait = function (gameid) {
        this.socket_.emit('request turn', gameid);
    };
})();
