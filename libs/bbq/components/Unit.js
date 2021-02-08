ns('bbq.components');
// type {string}, state {string}, level {int}, kills {int}
bbq.components.Unit = function (obj) {
    this.type = obj.type;
    this.state = obj.state || 'idle';
    this.level = obj.level || 1;
    this.kills = obj.kills || 0;
    this.className = function () { return 'Unit'; }        
};