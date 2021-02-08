var MapData = function (json) {
	this.mapid = null;
	this.tileset = null;
	this.width = 0; // unit in tiles
	this.height = 0; // unit in tiles
	this.terrain = null;
	this.props = null;
	this.startstate = null;
	averageTurnsToWin = 0;
	if (json) {
		for (var p in json) {
			this[p] = json[p];
		} // p
	} // json
} // MapData

module.exports.MapData = MapData;