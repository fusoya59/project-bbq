var unlockables = require('../../resources/unlockables');
var insensitivize = require('../utils').insensitivize;
var debug = require('../utils').debug;

function purchaseUnit(req, res) {
    var user = req.bbq.authorized(req);
    if (!user) {
        res.bbq.respondError(res, 'not authorized');
        return;
    }

    var unitType = unlockables.units[req.params.unitType];
    if (!unitType) {
        res.bbq.respondError(res, 'no such type ' + req.params.unitType);
        return;
    }

    var db = req.bbq.db;
    db.players.get({ playerid: insensitivize(user.playerid) }, function (docs) {
        if (!docs || docs.length == 0) {
            res.bbq.respondError(res, 'player id ' + user.playerid +' not found!');
            return;
        }
        var pdoc = docs[0];
        var currency = unitType.currency == 'BattleBadge' ? 'skulls' : 'shields';
        if (pdoc[currency] >= unitType.price) {

            // check if user has any unlocked things yet
            // check if user is trying to purchase an unlocked unit again
            var unlockedUnits = pdoc.unlockedUnits;
            var document = {};
            document.$inc = {};
            document.$inc[currency] = -unitType.price;
            if (!unlockedUnits) {
                document.$set = { unlockedUnits: [req.params.unitType] };
            }
            else {
                if (unlockedUnits.indexOf(req.params.unitType) >= 0) {
                    res.bbq.respondError(res, 'unit type ' + req.params.unitType + ' already unlocked!');
                    return;
                }
                document.$push = { unlockedUnits: req.params.unitType };
            }
            db.players.update(
                { playerid: insensitivize(user.playerid) },
                document,
                null,
                function (err, result) {
                    if (err) {
                        res.bbq.respondError(res, err);
                        return;
                    }
                    res.bbq.respondOk(res, 'successfully purchased ' + req.params.unitType);
                }
            );
        }
        else {
            res.bbq.respondError(res, 'not enough ' + unitType.currency + '! Required: ' + unitType.price);
        }
    });
}

module.exports.purchaseUnit = purchaseUnit;