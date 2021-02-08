ns('boc.resources');

// singleton that loads and caches all Image objects into memory
boc.resources.GraphicsManager = new function () {
    var _images = {};
    var _isInit = false;

    // loads a dictionary of image to image data strings to memory
    this.load = function (assets, onGraphicsLoaded) {
        if (_isInit) {
            if (onGraphicsLoaded) { onGraphicsLoaded(); }
            return;
        }
        var numLoaded = 0;
        for (var i in assets) {
            if (i == "count") continue;
            var img = new Image();
            img.src = "data:image/png;base64," + assets[i];
            img.tag = i;
            _images[i] = img;
            img.onload = function () {
                numLoaded++
                //if ($) $('#debug').text("Assets loaded: " + numLoaded + " / " + assets.count);
                if (numLoaded >= assets.count) {
                    _isInit = true;
                    if (onGraphicsLoaded) { onGraphicsLoaded(); }
                }
            }
        } //i
    }; // load

    // loads actual image files
    this.loadFiles = function (imageArr, onLoaded) {
        if (!(imageArr instanceof Array)) imageArr = [imageArr];
        var numLoaded = 0;
        //if ($) $("#debug").text("Assets loaded: 0 / " + imageArr.length);
        for (var i = 0; i < imageArr.length; i++) {
            var img = new Image();
            img.src = imageArr[i];
            img.tag = imageArr[i];
            _images[imageArr[i]] = img;
            img.onload = function () {
                numLoaded++;
                //if ($) $("#debug").text("Assets loaded: " + numLoaded + " / " + imageArr.length);
                if (numLoaded == imageArr.length && onLoaded) onLoaded();
            };
        } // for
    } // loadFiles

    // retrieves the image
    this.getImage = function (imagePath) {
        return _images[imagePath];
    }; // getImage

    // add an image forcibly
    this.addImage = function (path, img) {
        _images[path] = img;
    }
}; // GraphicsManager