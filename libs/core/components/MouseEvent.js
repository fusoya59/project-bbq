ns('boc.components');

// captures anything mouse related and encapsulates them as entities
// action {string}, element {object}, stateObj {object}
boc.components.MouseEvent = function (obj) {
    this.action = obj.action;
    this.element = obj.element;
    this.stateObj = obj.stateObj;
    this.timestamp = +new Date;
    this.className = function () { return 'MouseEvent'; }
};