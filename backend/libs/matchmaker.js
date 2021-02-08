var GameGenerator = require('./gamegenerator').GameGenerator;

var bbqUtils = require('./utils');
var insensitivize = bbqUtils.insensitivize;
// TODO: make this smarter. have it pause when it
//       fails to find a match X number of times.
//       resume when someone matchmakes.
var matchMakerId = null;
var matchMakerIsRunning = false;

// starts the match making service
// how it works is commented below.
function runMatchmakingService(db) {

    if (matchMakerId) {
        clearTimeout(matchMakerId);
    }

    if (!matchMakerIsRunning) {
        matchMakerIsRunning = true;
        bbqUtils.debug('starting match making service');
    }

    matchMakerId = setTimeout(function () {
        //bbqUtils.debug('searching for matches...');
        // find distinct players
        // for each player
        //   find a match (random) that's not the same player
        //   if i found one, 
        //      update this record {status:'ready', gameid:'somerandomcrap'}
        //      update that record {status:'ready', gameid:'somerandomcrap'}
        //   else continue  			

        // find pending matches...
        db['matches'].getdistinct('playerid', { status: 'pending' }, function (err, playerids) {
            function matchmake(playerids, pindex) {
                if (pindex >= playerids.length) { return; }

                var playerid = playerids[pindex];
                bbqUtils.debug('matching ' + playerid + '...');

                var randomPlayer = Math.floor(Math.random() * playerids.length);
                while (randomPlayer == pindex) {
                    randomPlayer = Math.floor(Math.random() * playerids.length);
                }
                var randomplayerid = playerids[randomPlayer];

                // find this player					
                db['matches'].get({ $and: [{ playerid: insensitivize(playerid) }, { status: 'pending' }] }, function (docs) {
                    if (docs && docs.length > 0) { // i found some pending requests				       

                        // make sure the opposing player is still pending
                        bbqUtils.debug('checking if ' + randomplayerid + ' is compatible...');
                        db['matches'].get({ $and: [{ playerid: insensitivize(randomplayerid) }, { status: 'pending' }] }, function (opposingDocs) {
                            if (opposingDocs && opposingDocs.length > 0) {
                                var gameId = 'game_' + playerid + '_' + randomplayerid + '_' + (+new Date());
                                var playerdoc = docs[0];
                                var oppdoc = opposingDocs[0];

                                bbqUtils.debug('updating player match ' + playerdoc.matchid);
                                db['matches'].update({ matchid: playerdoc.matchid }, { $set: { gameid: gameId, status: 'active' } });
                                bbqUtils.debug('updating opposing match ' + oppdoc.matchid);

                                db['matches'].update({ matchid: oppdoc.matchid }, { $set: { gameid: gameId, status: 'active' } });
                                bbqUtils.debug('matched ' + playerid + ' with ' + oppdoc.playerid);

                                GameGenerator.generateGame(gameId, playerid, [playerid, randomplayerid], null, db, function (gameObj) {                                    
                                    db.games.add(gameObj);
                                    matchmake(playerids, ++pindex);
                                });
                                //var gameObj = GameGenerator.generateGame(gameId, playerid, [playerid, randomplayerid]); // gameid, turn, players                                      
                               
                                //db.games.add(gameObj);

                                //matchmake(playerids, ++pindex);
                            } else {
                                bbqUtils.debug('no matches found for player ' + playerid);
                                matchmake(playerids, ++pindex);
                            }
                        });
                    } // there are pending matches
                    else {
                        bbqUtils.debug('no matches found for player ' + playerid);
                        matchmake(playerids, ++pindex);
                    } // there are no pending matches
                });
            } // matchmake

            if (playerids.length > 1) {
                bbqUtils.debug('setting up matches...');
                matchmake(playerids, 0);
            } else {
                //bbqUtils.debug('no matches found.');
            }
        });
        runMatchmakingService(db);
    },
	5000);
}

// stops the match making service
function stopMatchmakingService() {
    bbqUtils.debug('stopping match making service.');
    matchMakerIsRunning = false;
    if (matchMakerId) {
        clearTimeout(matchMakerId);
    }
}

module.exports.runMatchmakingService = runMatchmakingService;
module.exports.stopMatchmakingService = stopMatchmakingService;