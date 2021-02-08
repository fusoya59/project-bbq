// type {string}, turnsUntilCapture {int}
ns('bbq.components');
bbq.components.Building = function (obj) {
    this.type = obj.type;
    this.turnsUntilCapture = obj.turnsUntilCapture;
    this.className = function () { return 'Building'; }        
};