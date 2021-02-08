var _maps = require('../resources/maps.js');

var gamestateImport = require('./gamestate.js');
var PlayerState = gamestateImport.PlayerState;
var GameState = gamestateImport.GameState;
var UnitState = gamestateImport.UnitState;
var BuildingState = gamestateImport.BuildingState;

var gamesummaryImport = require('./gamesummary.js');
var GameSummary = gamesummaryImport.GameSummary;
var PlayerSummary = gamesummaryImport.PlayerSummary;


var GameGenerator = {};
GameGenerator.getRandomMap = function(Maps) {
	var maps = [];
	for (var m in Maps) {
		maps.push(m);
	}	
	return maps[Math.floor(Math.random() * maps.length)];
};

GameGenerator.generateGame = function (gameid, turn, playerids, mapid, db, callback) {

    _maps.getMaps(db, { enabledOnly: true }, function (Maps) {

        var gameState;
        var mapObj = mapid ? Maps[mapid] : Maps[GameGenerator.getRandomMap(Maps)];
        var startState = {};

        for (var i = 0; i < playerids.length; i++) {
            var playerid = playerids[i];
            var pstate = mapObj.startstate['_' + i + '_'];
            startState[playerid] = pstate;
        } // i
        startState['_neutral_'] = mapObj.startstate['_neutral_'];

        var summary = new GameSummary({
            players: [
               new PlayerSummary({
                   playerid: playerids[0],
                   team: 'Blue',
                   unitsProduced: 0,
                   unitsKilled: 0,
                   unitsLost: 0,
                   buildingsCaptured: 0,
                   buildingsLost: 0,
                   foodCollected: startState[playerids[0]].food,
                   foodConsumed: 0
               }),
               new PlayerSummary({
                   playerid: playerids[1],
                   team: 'Red',
                   unitsProduced: 0,
                   unitsKilled: 0,
                   unitsLost: 0,
                   buildingsCaptured: 0,
                   buildingsLost: 0,
                   foodCollected: startState[playerids[1]].food,
                   foodConsumed: 0
               })
            ] // players
        }); // summary

        gameState = new GameState(
            {
                gameid: gameid,
                turn: turn,
                state: startState,
                moves: [],
                mapid: mapObj.mapid,
                lastupdate: +new Date,
                summary: summary
            }
        ); // GameState

        if (callback) {
            callback(gameState);
        }

    });    	
} // generateGame

module.exports.GameGenerator = GameGenerator;