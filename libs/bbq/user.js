if (!window.bbq) { window.bbq = {}; }

var MAX_PENDING_MATCHES = 1;

bbq.User = function (json) {

	this.playerid = null;
	this.displayname = null;
	this.email = null;
	this.wins = 0;
	this.losses = 0;
	this.rating = 0;
	this.level = 0;
	this.experience = 0;
	this.avatar = null;
	this.skulls = 0; // battle badges
	this.shields = 0; // tribe tokens
	this.unlockedUnits = null;
	this.tutorialComplete = false;
	
	if (json) {
		for (var p in json) {
			this[p] = json[p];
		} // p	
	} // json
	
	this.pendingMatches = [];
	this.activeMatches = [];
	this.retiredMatches = [];

	this.pendingChallengeRequests = []; // i'm requesting a match
	this.pendingChallengeReplies = []; // i'm receiving a match request

	this.friends = [];
	this.pendingFriendRequests = []; // waiting for their reply
	this.pendingFriendResponses = []; // waiting for your reply

	
} // Player


bbq.Match = function (json) {
    this.matchid = null;
    this.gameid = null;
    this.opponent = null;
    this.status = null;
    this.turn = null;
    this.winner = null;
    this.mapid = null;
    this.challengeid = null;
    if (json) {
        for (var p in json) {
            this[p] = json[p];
        }
    }
}
