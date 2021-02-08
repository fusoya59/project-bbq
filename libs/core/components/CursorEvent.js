ns('boc.components');

// target {string}, oldLocation {object}, newLocation {object}
boc.components.CursorEvent = function (obj) {
    this.target = obj.target;
    this.oldLocation = obj.oldLocation;
    this.newLocation = obj.newLocation;
    this.className = function () { return 'CursorEvent'; }
};