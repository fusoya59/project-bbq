function PlayerSummary(json) {
	this.playerid = null;
	this.team = null;
	this.unitsProduced = 0;
	this.unitsKilled = 0;
	this.unitsLost = 0;
	this.buildingsCaptured = 0;
	this.buildingsLost = 0;
	this.foodCollected = 0;
	this.foodConsumed = 0;
	
	if (json) {
		for (var p in json) {
			this[p] = json[p];
		}
	}
}

function GameSummary(json) {
	this.players = null; // array
	if (json) {
		for (var p in json) {
			this[p] = json[p];
		}
	}
} // GameSummary

module.exports.PlayerSummary = PlayerSummary;
module.exports.GameSummary = GameSummary;