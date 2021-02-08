ns('boc.components')
// tags an entity for it to follow the camera
// camera {Camera}
boc.components.CameraFollow = function (obj) {
    this.camera = obj.camera;
    this.className = function () { return 'CameraFollow'; }
};