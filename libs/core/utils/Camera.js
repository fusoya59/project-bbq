ns('boc.utils');

/**
 * Orthographic camera
 * @constructor
 * @param {object} params - paramater list
 */
boc.utils.Camera = function (params) {
    var _this = this;
    // units in pixels
    this.xmin = params.xmin;
    this.xmax = params.xmax;
    this.ymin = params.ymin;
    this.ymax = params.ymax;
    this.zoom = 1.0;

    this.width = function () {
        return this.xmax - this.xmin;
    };
    this.height = function () {
        return this.ymax - this.ymin;
    };

    //this.org = {
    //    xmin: function() {
    //        return _this.xmin;// / _this.zoom;
    //    },
    //    xmax : function() {
    //        return _this.xmax * _this.zoom;
    //    },
    //    ymin: function() {
    //        return _this.ymin;// / _this.zoom;
    //    },
    //    ymax: function () {
    //        return _this.ymax * _this.zoom;
    //    }
    //};

    var _em = new boc.utils.EventManager();

    this.move = function (dx, dy) {
        // gotta clamp the min values
        this.update({
            xmin: this.xmin + dx,
            xmax: this.xmax + dx,
            ymin: this.ymin + dy,
            ymax: this.ymax + dy
        });
    }; // move

    this.update = function (obj) {
        if (!obj) { obj = {}; }
        if (obj.xmin == undefined || obj.xmin == null) { obj.xmin = this.xmin; }
        if (obj.ymin == undefined || obj.ymin == null) { obj.ymin = this.ymin; }
        if (obj.xmax == undefined || obj.xmax == null) { obj.xmax = this.xmax; }
        if (obj.ymax == undefined || obj.ymax == null) { obj.ymax = this.ymax; }
        if (obj.zoom == undefined || obj.zoom == null) { obj.zoom = this.zoom; }

        //if (obj.zoom != this.zoom) {
        //    obj.xmax = this.org.xmax() / obj.zoom;
        //    obj.ymax = this.org.ymax() / obj.zoom;
        //}

        var isSameCamera = obj.xmin == this.xmin && obj.ymin == this.ymin && obj.xmax == this.xmax && obj.ymax == this.ymax && obj.zoom == this.zoom;

        var oldCamera = { xmin: this.xmin, xmax: this.xmax, ymin: this.ymin, ymax: this.ymax, zoom: this.zoom };

        this.xmin = obj.xmin;
        this.xmax = obj.xmax;
        this.ymin = obj.ymin;
        this.ymax = obj.ymax;
        this.zoom = obj.zoom;

        if (!isSameCamera) {
            _em.notify('onchange', { oldCamera: oldCamera, newCamera: obj });
        }
    }; // update

    this.addListener = _em.addListener;

    this.removeListener = _em.removeListener;

    this.intersects = function (bounds) {
        return this.xmin < bounds.xmax * this.zoom && this.xmax / this.zoom > bounds.xmin &&
               this.ymin < bounds.ymax * this.zoom && this.ymax / this.zoom > bounds.ymin;
        //return this.org.xmin() < bounds.xmax && this.org.xmax() > bounds.xmin &&
        //       this.org.ymin() < bounds.ymax && this.org.ymax() > bounds.ymin;
        //return this.xmin / this.zoom < bounds.xmax && this.xmax > bounds.xmin  / this.zoom&&
        //       this.ymin / this.zoom < bounds.ymax && this.ymax > bounds.ymin / this.zoom;
    }; // intersects

    this.contains = function (point) {
        return point.x < this.xmax && point.x > this.xmin &&
               point.y < this.ymax && point.y > this.ymin;
    }; // contains
}; // Camera