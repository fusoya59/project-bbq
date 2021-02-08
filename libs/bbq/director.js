(function () {
    var sceneDiv = null;
    var currentScene = 0;
    var scenes = []; // jquery objects

    function scrollToIndex(index, onAnimationsFinished) {
        if (index == currentScene) {
            $(scenes[index]).css('display', '');
            if (onAnimationsFinished) { onAnimationsFinished(); }
            return;
        }
        $(scenes[index]).css('display', '');
        var offsetBy = '-=' + ($(scenes[index]).position().left - $(scenes[currentScene]).position().left);
        var animsFinished = 0;
        for (var i = 0; i < scenes.length; i++) {
            $(scenes[i]).animate({ left: offsetBy }, 350, function () {
                animsFinished++;
                //$(this).css('left', '0px');
                if (animsFinished == scenes.length && onAnimationsFinished) {
                    $(this).css('left', '0px');
                    onAnimationsFinished();
                } // if
            });
        } // i
    }

    window.director = {};
    director.setContainer = function (c) {
        sceneDiv = c;
    };

    director.push = function (html, onLoad, onScrollEnd) {
        var scene = $('<div>').addClass('scene').addClass('noSelect').addClass('noDrag').css('display', 'none');
        scene.attr('id', 'scene_' + scenes.length);
        scene.html(html);
        scenes.push(scene);
        $(sceneDiv).append(scene);
        if (onLoad) { onLoad(scene); }

        if (scenes.length == 1) {
            $(scene).css('display', '');
            if (onScrollEnd) { onScrollEnd(scene); }
            return;
        }

        var currSceneLeft = $(scenes[currentScene]).position().left + $(scenes[currentScene]).width();
        $(scene).css('left', currSceneLeft + 'px');
        scrollToIndex(currentScene + 1, function () {
            currentScene++;            
            if (onScrollEnd) { onScrollEnd(scene); }
        });
    };

    director.pop = function (onScrollEnd) {
        if (currentScene == 0) {
            var scene = scenes.pop();
            if (onScrollEnd) { onScrollEnd(scene); }
            $(scene).remove();
            return;
        }
        //if (scenes[currentScene - 1].onload) { scenes[currentScene - 1].onload(); }
        scrollToIndex(currentScene - 1, function () {
            var scene = scenes.pop();
            if (onScrollEnd) { onScrollEnd(scene); }
            $(scene).remove();
            currentScene--;
        });
    };

    director.replace = function (html, onLoad, onScrollEnd) {
        //var scene = $('<div>').addClass('scene').addClass('noSelect').addClass('noDrag').css('display', 'none');
        //scene.attr('id', 'scene_r' + scenes.length);
        //scene.html(html);
        //scenes.push(scene);

        //// first get the scene to replace's left position
        ////$(scene).css('left', $(scenes[currentScene]).css('left'));
        //$(sceneDiv).append(scene);
        //if (onLoad) { onLoad(scene); }

        //// now unload it
        //$(scenes[currentScene]).remove();

        //// and replace it with the new scene
        //$(sceneDiv).append(scene);
        //scenes[currentScene] = scene;        
        //if (onReplaceEnd) { onReplaceEnd(scene); }
        var scene = $('<div>').addClass('scene').addClass('noSelect').addClass('noDrag').css('display', 'none');
        scene.attr('id', 'scene_r' + scenes.length);
        scene.html(html);
        scenes.push(scene);
        $(sceneDiv).append(scene);
        if (onLoad) { onLoad(scene); }

        if (scenes.length == 1) {
            $(scene).css('display', '');
            if (onScrollEnd) { onScrollEnd(scene); }
            return;
        }

        var currSceneLeft = $(scenes[currentScene]).position().left + $(scenes[currentScene]).width();
        $(scene).css('left', currSceneLeft + 'px');
        scrollToIndex(currentScene + 1, function () {
            var prevScene = scenes.splice(scenes.length - 2, 1)[0];
            prevScene.remove();            
            if (onScrollEnd) { onScrollEnd(scene); }
        });
    };

    director.currentScene = function () {
        return scenes[currentScene];
    }
})();