ns('boc.resources');
boc.resources.SoundManager = function () {
};

boc.resources.SoundManager.prototype = {
    _audio: {},
    loadFiles: function (files, onComplete) {
        var _this = this;
        if (!(files instanceof Array)) {
            files = [files];
        }
        if (files.length === 0 && onComplete) {            
            onComplete();
            return;
        }
        var completed = 0;
        var isComplete = function () {
            
            if (++completed === files.length) {                
                if (onComplete) {
                    onComplete(_this);
                }
            }
        };
        
        for (var i = 0; i < files.length; i++) {
            if (this._audio[files[i]]) {
                isComplete();
            }
            else {
                // let's use xhr to preload these audio
                // i'm finding Audio is hit or miss
                //(function (fname) {
                //    $.ajax(
                //        {
                //            url: files[i],
                //            success: function () {
                //                var audio = new Audio(fname);
                //                audio.addEventListener('canplaythrough', function () {
                //                    console.log(fname);
                //                    audio.pause();
                //                    audio.volume = 1;
                //                    _this._audio[fname] = audio;
                //                    isComplete();
                //                });
                //                audio.volume = 0;
                //                audio.play();
                //            }
                //        }
                //    );
                //})(files[i]);
                
                (function (fname) {
                    var audio = new Audio(files[i]);
                    audio.addEventListener('canplaythrough', function () {
                        console.log(fname);
                        //audio.pause();
                        audio.volume = 1;
                        _this._audio[fname] = audio;
                        isComplete();
                    });
                    audio.volume = 0;
                })(files[i]);
                //var audio = new Audio(files[i]);
                //audio.preload = 'auto';
                //audio.volume = 0;
                ////audio.play();
                //(function (fname, a) {
                //    a.addEventListener('canplaythrough', function () {                       
                //        console.log(fname);                                                                        
                //        //audio.pause();
                //        a.volume = 1;
                //        _this._audio[fname] = a;
                //        isComplete();
                //    });                    
                //})(files[i], audio);                                
            }            
        } //i        
    },
    getAudio: function (id) {
        return this._audio[id];
    }
};

(function () {
    var sm = new boc.resources.SoundManager();
    boc.sm = function () {
        return sm;
    };
})();
