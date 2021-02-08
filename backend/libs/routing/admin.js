var matchMaker = require('../matchmaker');
var backendUtils = require('../utils');
var maps = require('../../resources/maps');

var adminkey = backendUtils.ADMIN_KEY;
var ADMIN_PLAYERID = backendUtils.ADMIN_PLAYERID;
var ADMIN_IP = backendUtils.ADMIN_IP;

// enable=$all|mapid
// disable=$all|mapid
function mapCommand(req, res) {
    if (req.query.enable) {
        maps.enable(req.query.enable);
        res.bbq.respondOk(res, 'enabled ' + req.query.enable);
    }
    else if (req.query.disable) {
        if (req.query.disable == '$all') {
            maps.getMaps(req.bbq.db, { enabledOnly: false }, function (mapsObj) {
                for (var i in mapsObj) {
                    maps.disable(i);
                }
                res.bbq.respondOk(res, 'disabled ' + req.query.disable);
            });
        } else {
            maps.disable(req.query.disable);
            res.bbq.respondOk(res, 'disabled ' + req.query.disable);
        }
    }
    else {        
        maps.getMaps(req.bbq.db, { enabledOnly : false }, function (mapsObj) {
            for (var i in mapsObj) {
                mapsObj[i].disabled = maps.isDisabled(i);
            }
            res.bbq.respondOk(res, mapsObj);
        });
        //res.bbq.respondError(res, 'need to pass "enable", "enableOnly", or "disable" parameter!');
    }
}

// admin access stuff to manage the database
// needs a key as defined in adminkey var
// action=truncate, collection=collectionname - truncates all data in the given collection
// action=startmm, action=stopmm - starts or stops the matchmaking service
// action=get, collection=collectionname, _field=value, _field2=value... - gets the rows that match _fields (and together)
// action=remove, collection=collectionname, _field=value, _field2=value... - removes the rows that match _fields (and together)
module.exports.admin = function (req, res) {
    var db = req.bbq.db;
    if (req.query.key && req.query.key == adminkey) {
        if (req.query.action) {
            if (req.query.action == 'truncate') {
                if (req.query.collection) {
                    db[req.query.collection].remove(null, function () {
                        res.bbq.respondOk(res, 'successfully truncated ' + req.query.collection, req.query.callback);
                    });
                } else {
                    res.bbq.respondError(res, 'error: no collection specified', req.query.callback)
                }
            } // truncate
            else if (req.query.action == 'startmm') {
                matchMaker.runMatchmakingService(db);
                res.bbq.respondOk(res, 'successfully started matchmaker.');
            } // startmm
            else if (req.query.action == 'stopmm') {
                matchMaker.stopMatchmakingService();
                res.bbq.respondOk(res, 'successfully stopped matchmaker.');
            } // stopmm     
            else if (req.query.action == 'get' && req.query.collection && db[req.query.collection]) {
                var query = {};
                for (var key in req.query) {
                    if (key.indexOf('_') == 0) {
                        query[key.substring(1)] = req.query[key];
                    }
                } // for key
                db[req.query.collection].getcollection().find(query).toArray(function (err, docs) {
                    res.bbq.respondOk(res, docs);
                });
            }
            else if (req.query.action == 'remove' && req.query.collection && db[req.query.collection]) {
                var query = {};
                for (var key in req.query) {
                    if (key.indexOf('_') == 0) {
                        query[key.substring(1)] = req.query[key];
                    }
                } // for key
                db[req.query.collection].getcollection().remove(query, function (err) {
                    if (err) {
                        res.bbq.respondError(res, 'error removing items.')
                    } else {
                        res.bbq.respondOk(res, 'successfully removed items');
                    }
                });
            }
            else if (req.query.action == 'generategame') {
                var gameStateObj = GameGenerator.generateGame('gameid_1', 'mark', ['mark', 'alvin']);
                res.bbq.respondOk(res, gameStateObj);
            }
            else if (req.query.action == 'map') {
                mapCommand(req, res);
            }
            else {
                res.bbq.respondError(res, 'invalid admin action');
            }
        } else {
            res.bbq.respondError(res, 'no action specified')
        }
    } else {
        res.bbq.respondError(res, 'not authorized');
    }
};