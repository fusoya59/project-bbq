(function () {

    /**
     * Creates a global namespace for the given string
     * @param {string} namespaceStr - This is the namespace. Period delimited.
     * @return {object} Returns the namespace object.
     */
    var ns = function (namespaceStr) {
        if (!namespaceStr) {
            return;
        }
        var nsArr = namespaceStr.split('.');
        var nsStr = '';
        var nsObj = window[nsArr[0]];
        if (!nsObj) {
            nsObj = {};
            window[nsArr[0]] = nsObj;
        }
        for (var i = 1; i < nsArr.length; i++) {
            var ns;
            if (!nsObj[nsArr[i]]) {
                ns = {};
                nsObj[nsArr[i]] = ns;
            } else {
                ns = nsObj[nsArr[i]];
            }
            nsObj = ns;
        }
        return nsObj;
    }
    window.ns = ns;

    /**
     * Loads an array of script files. An element in the array can be another
     * array, which means those array of scripts are dependent on the previous
     * script. See include/bbq.js for an example.
     * @param {Array} scripts The array of scripts to load.
     * @param {function} complete Callback given once the scripts are done loading.
     */
    var sl = function (scripts, complete) {
        var total = scripts.length;
        var loaded = 0;
        var checkComplete = function () {            
            if (++loaded == total) {                
                if (complete) {                    
                    complete();
                }
            }
        };
        for (var i = 0; i < total; i++) {
            (function (_i) {
                if (scripts[_i] instanceof Array) {
                    total--;
                    return;
                }
                var scAhead = scripts[i + 1];                
                var script = document.createElement('script');                
                script.type = 'text/javascript';
                script.src = scripts[_i];
                script.onload = function () {
                    if (scAhead && scAhead instanceof Array) {
                        sl(scAhead, checkComplete);
                    }
                    else {
                        checkComplete();
                    }
                };
                document.getElementsByTagName('head')[0].appendChild(script);
            })(i);
        }
    };

    window.loadScripts = sl;
})();