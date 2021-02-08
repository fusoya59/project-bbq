ns('boc.components');

// Occurs whenever the camera is moved
// action {string}
boc.components.PanningCameraEvent = function (p) {
    this.action = p;
    this.className = function () { return 'PanningCameraEvent'; }
};