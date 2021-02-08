ns('bbq.events');
// p = action : [ 'saveAll', 'saveMoves', 'saveGameState' ], q = playerid, r = onSavecomplete
bbq.events.SaveEvent = function (p, q, r) {
    this.action = p;
    this.playerid = q;
    this.onSaveComplete = r;
    this.className = function () { return 'SaveEvent'; }
};