var bbq = bbq || {};

(function (ns) {
    var UiCache = function () {
    };

    UiCache.prototype.loadUi = function (uiRoot, uiFiles, onComplete, exclude) {
        var completed = 0;
        var _this = this;
        for (var i = 0; i < uiFiles.length; i++) {
            var fp = uiRoot + uiFiles[i];
            (function (filePath) {
                boc.utils.loadHtml(filePath, uiRoot, function (data) {
                    _this[filePath] = data;
                    if (++completed == uiFiles.length && onComplete) {
                        onComplete();
                    }
                },
                exclude);
            })(fp);
        }
    };
    ns.UiCache = new UiCache();
})(bbq);
