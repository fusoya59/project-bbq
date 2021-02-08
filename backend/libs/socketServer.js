var bbqUtils = require('./utils');

var TURN_REQUEST_TIMEOUT = 5000; //ms

module.exports = function (io) {

    function setupListeners(socket) {
        socket.bbq = socket.bbq || {};
        socket.on('request turn', function (gameid) {
            bbqUtils.debug('requesting turn for game ' + gameid);
            if (socket.bbq.turnCallbackHandle) {
                clearTimeout(socket.bbq.turnCallbackHandle);
            }
            socket.bbq.turnCallback = function () {
                bbqUtils.debug('looking for ' + gameid);
                io.bbq.db.games.get({gameid : gameid}, function (docs) {
                    // if it is the user's turn tell the client
                    if (docs && docs.length > 0) {
                        var gamedoc = docs[0];
                        if (gamedoc.state[socket.user.playerid] && gamedoc.turn == socket.user.playerid) {
                            clearTimeout(socket.bbq.turnCallbackHandle);
                            socket.bbq.turnCallback = null;
                            socket.emit('your turn', gamedoc);
                            return;
                        }
                        // otherwise wait TURN_REQUEST_TIMEOUT ms for next poll
                        socket.bbq.turnCallbackHandle = setTimeout(socket.bbq.turnCallback, TURN_REQUEST_TIMEOUT);
                    } else {
                        socket.emit('turn request ended', 'game id "' + gameid + '" not found');
                    }                    
                });
            };
            // see if it's user's turn
            socket.bbq.turnCallback();            
        });
        socket.on('stop turn request', function (gameid) {
            bbqUtils.debug('stopping turn request for game ' + gameid);
            removeListeners(socket);
            socket.emit('turn request ended', 'user invoked');
        });
    }

    function removeListeners(socket) {
        if (!socket.user) {
            return;
        }
        if (socket.bbq) {
            if (socket.bbq.turnCallbackHandle) {
                clearTimeout(socket.bbq.turnCallbackHandle);
            }
            if (socket.bbq.turnCallback) {
                socket.bbq.turnCallback = null;
            }
        }
    }

    io.sockets.on('connection', function (socket) {        
        console.log('client connected.');
        socket.emit('challenge request');
        socket.on('challenge response', function (data) {
            console.log(data);
            if (data && bbqUtils.isTrustedDomain(data.origin)) {                
                var user = bbqUtils.decryptSession(data.boc_session);                
                if (user) {
                    socket.user = user;
                    socket.emit('challenge accepted', user);
                    setupListeners(socket);
                    return;
                }
            }
            socket.emit('challenge rejected');            
        });
        socket.on('disconnect', function () {
            console.log('client disconnected.', socket.user ? socket.user.playerid : '');
            removeListeners(socket);
            socket.user = null;
        });
    });
};