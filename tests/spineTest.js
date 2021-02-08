function loadSpine(files, options) {
    if (!options) {
        options = {            
            teams : [ '' ]
        };
    }

    var batchMult = 2 + options.teams.length;
    var fileTotal = batchMult * files.length;
    var filesLoaded = 0;
    var object = {};

    var checkComplete = function () {
        if (filesLoaded == fileTotal) {
            if (options.onload) {
                options.onload(object);
            }
        }
    }

    for (var i = 0; i < files.length; i++) {

        var assetName = files[i].substring(files[i].lastIndexOf('/') + 1);
        // allocate at start
        for (var j = 0; j < options.teams.length; j++) {
            var newName = assetName + '_' + options.teams[j];
            object[newName] = {};
        }

        (function (aname, fpath) {
            var directory = fpath.substring(0, fpath.lastIndexOf('/')) + '/';
            $.get(files[i] + '.atlas', function (data) {                
                for (var j = 0; j < options.teams.length; j++) {
                    var newName = aname + '_' + options.teams[j];
                    object[newName].atlas = data.replace(/(\w+).png/,  directory + '$1_' + options.teams[j] + '.png');
                }
                filesLoaded++;
                checkComplete();
            });
            $.get(files[i] + '.json', function (data) {
                var json = JSON.parse(data);
                for (var j = 0; j < options.teams.length; j++) {
                    var newName = aname + '_' + options.teams[j];
                    object[newName].skeleton = json;
                }
                filesLoaded++;
                checkComplete();
            });
        })(assetName, files[i]);
                
        var imageNames = [];
        for (var j = 0; j < options.teams.length; j++) {
            imageNames[j] = files[i] + '_' + options.teams[j] + '.png';
        }

        boc.resources.GraphicsManager.loadFiles(imageNames, function () {
            filesLoaded += 2;
            checkComplete();
        });
    }
}