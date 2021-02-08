var GameState = function(json) {
	this.gameid = null;
	this.turn = null;
	this.state = null; // player state
	this.moves = null;
	this.mapid = null;
	this.winner = null;
	this.lastupdate = 0; // utc timestamp
	this.summary = null;
	
	if (json) {
		for (var p in json) {
			if (p == 'state') {
				this.state = {};
				for (var playerid in json[p]) {
					this.state[playerid] = new PlayerState(json[p][playerid]);
				} // playerid
			} else {
				this[p] = json[p];
			}
		} // for p 
	}
} // Game

var BuildingState = function(json) {
	this.type = null;
	this.location = null; // obj x y
	this.turnsUntilCapture = 0;
	this.buffs = undefined; // array
    this.debuffs = undefined; // array
	if (json) {
		for (var p in json) {
			this[p] = json[p];
		} // p
	}
} // BuildingData

var UnitState= function (json) {
	this.type = null;
	this.location = null; // obj x y
	this.state = null;
	this.hp = 0;
	this.options = null; // obj
	this.buffs = undefined; // array
	this.debuffs = undefined; // array
	if (json) {
		for (var p in json) {
			this[p] = json[p];
		} // p
	}
} // UnitData

var PlayerState = function (json) {
	this.food = 0;
	this.turn = 0;
	this.team = null;
	this.upkeep = false; // turns to true on player's start of turn
	this.buildings = null; // array
	this.units = null; // array
	if (json) {
		for (var p in json) {
			if (p == 'units') {	
				this.units = [];
				for (var u in json[p]) {
					this.units.push(new UnitState(json[p][u]));
				} // u
			} 
			else if (p == 'buildings') {
				this.buildings = [];
				for (var b in json[p]) {
					this.buildings.push(new BuildingState(json[p][b]));
				} // b
			} 
			else {
				this[p] = json[p];	
			}
		} // p
	}
} // GameState

module.exports.GameState = GameState;
module.exports.PlayerState = PlayerState;
module.exports.BuildingState = BuildingState;
module.exports.UnitState = UnitState;