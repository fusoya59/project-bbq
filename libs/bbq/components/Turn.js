ns('bbq.components');
// playerid {string}, number {int}
bbq.components.Turn = function (p) {
    this.playerid = p.playerid;
    this.number = p.number;        
    this.className = function () { return 'Turn'; }      
};