ns('boc.components');

// x {number}, y {number}, z {number}, width {number}, height {number}
boc.components.Spatial = function (obj) {
    boc.utils.EventEmitter.call(this, obj);
    
    this.x = obj.x;
    this.y = obj.y;
    this.z = obj.z || 0;
    this.width = obj.width;
    this.height = obj.height;
    this.angle = obj.angle || 0; // radians
    this.scale = 1.0;
    if (typeof (obj.scale) != 'undefined' && obj.scale != null) {
        obj.scaleX = obj.scale;
        obj.scaleY = obj.scale;
        this.scale = obj.scale;
    }
    this.scaleX = typeof (obj.scaleX) != 'undefined' && obj.scaleX != null ? obj.scaleX : 1.0;
    this.scaleY = typeof (obj.scaleY) != 'undefined' && obj.scaleY != null ? obj.scaleY : 1.0;

    // favor X scale
    if (this.scaleX != this.scale) {
        this.scale = this.scaleX;
    }
    this.className = function () { return 'Spatial'; }

    //var _em = new boc.utils.EventManager();
    //this._em = new boc.utils.EventManager();
        
    // this HAS to be called whenever you need to update any fields from this Spatial component
    //this.update = function (obj) {
    //    if (!obj) { obj = {}; }
    //    if (obj.x == undefined || obj.x == null) { obj.x = this.x; }
    //    if (obj.y == undefined || obj.y == null) { obj.y = this.y; }
    //    if (obj.z == undefined || obj.z == null) { obj.z = this.z; }
    //    if (obj.width == undefined || obj.width == null) { obj.width = this.width; }
    //    if (obj.height == undefined || obj.height == null) { obj.height = this.height; }
    //    if (obj.scaleX == undefined || obj.scaleX == null) { obj.scaleX = this.scaleX; }
    //    if (obj.scaleY == undefined || obj.scaleX == null) { obj.scaleY = this.scaleY; }

    //    var isSameDimension = obj.x == this.x && obj.y == this.y && obj.z == this.z && obj.width == this.width && obj.height == this.height
    //    && obj.scaleX == this.scaleX && obj.scaleY == this.scaleY;

    //    var oldDim = { x: this.x, y: this.y, z : this.z, width: this.width, height: this.height, scaleX : this.scaleX, scaleY : this.scaleY };

    //    this.x = obj.x;
    //    this.y = obj.y;
    //    this.z = obj.z;
    //    this.width = obj.width;
    //    this.height = obj.height;
    //    this.scaleX = obj.scaleX;
    //    this.scaleY = obj.scaleY;

    //    if (!isSameDimension) {
    //        _em.notify('onchange', { oldDimension: oldDim, newDimension: obj });
    //    }            
    //}; // update

    //this.addListener = this._em.addListener;
    //this.removeListener = this._em.removeListener;
};

boc.utils.inherits(boc.components.Spatial, boc.utils.EventEmitter);

boc.components.Spatial.prototype.update = function (obj) {
    if (!obj) { obj = {}; }
    if (obj.x == undefined || obj.x == null) { obj.x = this.x; }
    if (obj.y == undefined || obj.y == null) { obj.y = this.y; }
    if (obj.z == undefined || obj.z == null) { obj.z = this.z; }
    if (obj.width == undefined || obj.width == null) { obj.width = this.width; }
    if (obj.height == undefined || obj.height == null) { obj.height = this.height; }
    if (obj.scaleX == undefined || obj.scaleX == null) { obj.scaleX = this.scaleX; }
    if (obj.scaleY == undefined || obj.scaleX == null) { obj.scaleY = this.scaleY; }

    var isSameDimension = obj.x == this.x && obj.y == this.y && obj.z == this.z && obj.width == this.width && obj.height == this.height
    && obj.scaleX == this.scaleX && obj.scaleY == this.scaleY;

    var oldDim = { x: this.x, y: this.y, z: this.z, width: this.width, height: this.height, scaleX: this.scaleX, scaleY: this.scaleY };

    this.x = obj.x;
    this.y = obj.y;
    this.z = obj.z;
    this.width = obj.width;
    this.height = obj.height;
    this.scaleX = obj.scaleX;
    this.scaleY = obj.scaleY;

    if (!isSameDimension) {
        //this._em.notify('onchange', { oldDimension: oldDim, newDimension: obj });
        this.notify('onchange', { oldDimension: oldDim, newDimension: obj });
    }
};