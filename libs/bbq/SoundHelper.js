ns('bbq');
bbq.SoundHelper = function () {

    var _this = this;
    //var _soundStates = {
    //    // key : { volume, loop, paused }
    //};
	
	this.disable = function () {
		this.onblur();
	}
	
	this.enable = function () {
		this.onfocus();
	}

    this.onblur = function () {
        //console.log('blur');
        //for (var k in boc.sm()._audio) {
        //    _soundStates[k] = {
        //        volume: boc.sm()._audio[k].volume,
        //        loop: boc.sm()._audio[k].loop,
        //        paused: boc.sm()._audio[k].paused
        //    };
        //    boc.sm()._audio[k].volume = 0;
        //    //_this.fadeOut(boc.sm()._audio[k], 1000);
        //    //boc.sm()._audio[k].volume = 0;
        //}
        for (var k in boc.sm()._audio) {
            boc.sm()._audio[k].muted = true;
        }
    };

    this.onfocus = function () {
        //console.log('focus');
        //for (var k in _soundStates) {
        //    var m = boc.sm().getAudio(k);
        //    (function (audio, state) {
        //        _this.fadeIn(audio, 1000, function () {
        //            audio.volume = state.volume;
        //            audio.loop = state.loop;                    
        //        });
        //    })(m, _soundStates[k]);
        //} // k
        if (!_this._muted) {
            for (var k in boc.sm()._audio) {
                boc.sm()._audio[k].muted = false;
            }
        }
    };

    window.addEventListener('blur', this.onblur);
    window.addEventListener('focus', this.onfocus);
}

bbq.SoundHelper.prototype = {

    allOn: function () {
        if (this._muted) {
            this._muted = false;
            for (var k in boc.sm()._audio) {
                boc.sm()._audio[k].muted = false;
            }
        }
    },

    _muted : false,
    //_allSoundStates : {},
    allOff: function () {
        if (!this._muted) {
            for (var k in boc.sm()._audio) {
                boc.sm()._audio[k].muted = true;
            }
            this._muted = true;
        }
    },

    // music/name
    //   sh.getAudio('music/forest');
    // ambience/name
    //   sh.getAudio('ambience/forest');
    // effects/name
    //   sh.getAudio('effects/buttonClick');
    // (unitDeath|unitHit|unitSelect|unitTrain|unitWalk|weaponHit|weaponWindup)
    //   sh.getAudio('#0', 'unitHit');
    getAudio: function (entity, type) {
        if (arguments.length == 1) {
            type = entity;            
            return boc.sm().getAudio('assets/sounds/' + type + bbq.assets.sound_extension);            
        }
        else if (arguments.length === 2) {
            var unit = $em(entity).comp('Unit');
            if (!unit) {
                return null;
            }
            var template = 'assets/sounds/effects/$0/' + type + bbq.assets.sound_extension;
            var audio = boc.sm().getAudio(template.replace('$0', unit.type));
            if (audio) {
                return audio;
            }
            else {
                return boc.sm().getAudio(template.replace('$0', 'default'));
            }
        }
    },
    
    play: function (audio, loop) {
        if (audio) {        
            audio.loop = loop ? true : false;
            if (audio.loop) {
                audio.currentTime = 0;
            }
            audio.play();
        }
    },
    stop: function (audio) {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }        
    },
    pause: function (audio) {
        if (audio) {
            audio.pause();
        }        
    },
    fadeOut: function (audio, timeMs, callback) {
        if (audio) {
            if (!timeMs) {
                timeMs = 2000;
            }
            var steps = 50,
                timeDelta = timeMs / steps,
                volumeDelta = -1.0 / steps;

            var volDown = function () {
                var vol = audio.volume + volumeDelta;

                audio.volume = Math.max(vol, 0);
                if (--steps > 0 && audio.volume > 0) {
                    setTimeout(volDown, timeDelta);
                }
                else {
                    if (callback) {
						var p = {audio: audio};
                        callback(p);
                    }
                }
            };
            volDown();
        }
    },
    fadeIn: function (audio, timeMs, callback) {
        if (audio) {
            if (!timeMs) {
                timeMs = 2000;
            }
            var steps = 50,
                timeDelta = timeMs / steps,
                volumeDelta = 1.0 / steps;

            var volDown = function () {
                var vol = audio.volume + volumeDelta;
                audio.volume = Math.min(vol, 1);
                if (--steps > 0 && audio.volume < 1) {
                    setTimeout(volDown, timeDelta);
                }
                else {
                    if (callback) {
                        callback();
                    }
                }
            };
            volDown();
        }
    },
    reset: function (audio) {
        if (audio) {
            audio.currentTime = 0;
            audio.volume = 1;
            audio.pause();
        }
    },

    newAudio: function (audioScript) {        
        boc.utils.createEvent(audioScript, $em());
    }    
};

(function () {
    var sh = new bbq.SoundHelper();
    bbq.sh = function () {
        return sh;
    };
})();
