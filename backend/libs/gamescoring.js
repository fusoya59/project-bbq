var Maps = require('../resources/maps.js').Maps;

var GameScoring = {};

var TOKEN_CAP_MIN = 1;
var TOKEN_CAP_MAX = 10;
var XP_MULTIPIER = 10.0;
var WIN_BONUS = 1.0;


// returns an object
// { unitTokens, foodTokens, buildingTokens, turnTokens, preBonusTotal:{xp,tokens}, winBonus:{xp,tokens}, itemBonus:{xp,tokens} }
GameScoring.generateScore = function(summary) {
    // takes in summary
    //   { unitsKilled, unitsLost, foodCollected, foodConsumed, buildingsCaptured, buildingsLost }
    // + { turns, isWinner, itemsUsed, mapid }
    if (!summary.unitsKilled) { summary.unitsKilled = 0; }
    if (!summary.unitsLost) { summary.unitsLost = 0; }
    var unitTokens = Math.max( TOKEN_CAP_MIN, Math.min(TOKEN_CAP_MAX, summary.unitsKilled - summary.unitsLost) );
    
    // TODO: this formula needs fixing! 
    if (!summary.turns) { summary.turns = 0; }
    var turnTokens = Math.max( TOKEN_CAP_MIN, Math.min(TOKEN_CAP_MAX, summary.turns - Maps[summary.mapid].averageTurnsToWin));
    
    if (!summary.foodCollected) { summary.foodCollected = 0; }
    if (!summary.foodConsumed) { summary.foodConsumed = 0; }
    var foodTokens = Math.max( TOKEN_CAP_MIN, Math.min(TOKEN_CAP_MAX, Math.floor((summary.foodCollected + summary.foodConsumed) / Maps[summary.mapid].averageTurnsToWin )) );
    
    if (!summary.buildingsCaptured) { summary.buildingsCaptured = 0; }
    if (!summary.buildingsLost) { summary.buildingsLost = 0; }
    var buildingTokens = Math.max ( TOKEN_CAP_MIN, Math.min( TOKEN_CAP_MAX, summary.buildingsCaptured - summary.buildingsLost ) );
    
    var preBonusTotal = {
        xp : Math.ceil((unitTokens + turnTokens + foodTokens + buildingTokens) * XP_MULTIPIER),
        tokens: (unitTokens + turnTokens + foodTokens + buildingTokens)               
    };
    
    var winBonusMultiplier = summary.isWinner ? WIN_BONUS : 0.0;
    
    var winBonus = {
        xp : Math.ceil(preBonusTotal.xp * winBonusMultiplier),
        tokens : Math.ceil(preBonusTotal.tokens * winBonusMultiplier) 
    };
    
    var itemBonusMultiplier = 0.0; // TODO: implement item system
    
    var itemBonus = {
        xp : Math.ceil( (preBonusTotal.xp + winBonus.xp) * itemBonusMultiplier),
        tokens : Math.ceil( (preBonusTotal.tokens + winBonus.tokens) * itemBonusMultiplier)
    };
    
    return {
        unitTokens : unitTokens,
        turnTokens : turnTokens,
        foodTokens : foodTokens,
        buildingTokens : buildingTokens,
        preBonusTotal : preBonusTotal,
        winBonus : winBonus,
        itemBonus : itemBonus        
    };
} // generateScore

module.exports.GameScoring = GameScoring;
