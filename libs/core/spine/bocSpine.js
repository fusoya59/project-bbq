/// <reference path="../core/components.js" />
/// <reference path="../core/constants.js" />
/// <reference path="../core/utils.js" />
/// <reference path="./spine-js_files/spine.js" />

// depends on spine.js, boc.resources

// This is everything that allows app programmers to use the entity system
// with spine runtime. It basically wraps spine runtime objects into 
// components.

ns('boc.spine');

// Singleton that contains all the spine skeleton data and caches them to memory
boc.spine.SkeletonManager = new function SkeletonManager() {
    var atlases_ = {};
    var skeletonData_ = {};

    // loads the dictionary of key, value pairs. value is described below.
    // p { { skeletonName : { atlasString, skeletonJson } } }
    this.load = function (p, onLoaded) {
        for (var skeletonName in p) {
            if (atlases_[skeletonName] && skeletonData_[skeletonName]) { // already loaded
                continue;
            }
            var skelAtlasPair = p[skeletonName];
            var atlas = new spine.Atlas(
                skelAtlasPair.atlas,
                {
                    load: function () { }
                }
            );
            atlases_[skeletonName] = atlas;
            
            var json = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(atlas));
            var skeletonData = json.readSkeletonData(skelAtlasPair.skeleton);
            skeletonData.name = skeletonName;
            skeletonData_[skeletonName] = skeletonData;
        }
        if (onLoaded) {
            onLoaded();
        }
    };

    // retrieves the skeleton data
    // p {string} skeleton name
    this.getSkeletonData = function (p) {
        return skeletonData_[p];
    }

    // creates an instance of a Skeleton with the given offset
    // p {string} skeleton name, offset { x, y }
    this.createSkeleton = function (p, offset) {
        var sdata = skeletonData_[p];
        if (sdata) {
            var skeleton = new spine.Skeleton(sdata);
            skeleton.getRootBone().x = offset ? offset.x : 0;
            skeleton.getRootBone().y = offset ? offset.y : 0;
            skeleton.updateWorldTransform();
            return skeleton;
        }
    };
};

// singleton that caches all spine animation states
boc.spine.AnimationStateManager = new function AnimationStateManager() {
    var animationStateData_ = {};

    this.getAnimationData = function (p) {
        return skeletonData_[p];
    };
    this.setAnimationData = function (p, q) {
        animationStateData_[p] = q;
    };
};

// simple component wrapper for spine skeletons
// p : { skeleton, visible }
boc.spine.SpineDrawable = function SpineDrawable(p) {
    this.skeleton = p.skeleton;
    this.visible = p.visible;
    this.className = function () {
        return 'SpineDrawable';
    }
};

// simple component wrapper for spine animation states
// p : { target {string}, state }
// emits : 'onComplete (animationName)'
boc.spine.SpineAnimation = function SpineAnimation(p) {    
    this.target = p.target; // target entity
    this.state = p.state || boc.constants.ANIMATION_STOPPED; 
    var spineDrawable = $em(this.target).comp('SpineDrawable');
    var animationStateData = boc.spine.AnimationStateManager[spineDrawable.skeleton.data.name];
    if (!animationStateData) {
        animationStateData = new spine.AnimationStateData(spineDrawable.skeleton.data);
        boc.spine.AnimationStateManager[spineDrawable.skeleton.data.name] = animationStateData;
    }
    this.animationState = new spine.AnimationState(animationStateData);        
    this.className = function () {
        return 'SpineAnimation';
    }

    this.eventManager = new boc.utils.EventManager(this);
};

// system that calls spine run time to apply animations
boc.spine.SpineAnimationSystem = function () {
    this.processTick = function (lastFrameTime) {
        $em('SpineAnimation').each(function (e, c) {
            if (c.target) {
                var spineDrawable = $em(c.target).comp('SpineDrawable');
                if (c.state == boc.constants.ANIMATION_PLAYING) {
                    c.animationState.update(lastFrameTime / 1000); // takes in seconds
                    c.animationState.apply(spineDrawable.skeleton);
                    spineDrawable.skeleton.updateWorldTransform();
                    if (!c.animationState.currentLoop && c.animationState.isComplete()) {
                        c.state = boc.constants.ANIMATION_STOPPED;
                        c.emit('onComplete', c.animationState.current.name);
                    }
                }
            }
        });
    };
};

// spine render routine
boc.spine.renderSkeleton = function (skeleton, context) {
    context.scale(1, -1);
    //var transformBones = function (bone) {
    //    if (bone.parent) {
    //        transformBones(bone.parent);
    //    }
    //    context.translate(bone.x, bone.y);
    //    context.rotate(bone.rotation * Math.PI / 180);
    //    context.scale(bone.scaleX, bone.scaleY);
    //};
    var drawOrder = skeleton.drawOrder;    
    for (var i = 0; i < drawOrder.length; i++) {
        var slot = drawOrder[i];
        var attachment = slot.attachment;
        if (!(attachment instanceof spine.RegionAttachment)) {
            continue;
        }

        context.save();
                
        context.translate(slot.bone.worldX, slot.bone.worldY);
        context.rotate(slot.bone.worldRotation * Math.PI / 180);
        context.scale(slot.bone.worldScaleX, slot.bone.worldScaleY);

        context.translate(attachment.x, attachment.y);
        context.rotate((attachment.rotation)* Math.PI / 180);
        context.scale(attachment.scaleX, attachment.scaleY);

        context.globalAlpha = slot.a;

        context.scale(1, -1);

        context.drawImage(
            boc.resources.GraphicsManager.getImage(attachment.rendererObject.page.name),
            // src
            attachment.rendererObject.x, attachment.rendererObject.y, attachment.rendererObject.width, attachment.rendererObject.height,
            // dst
            -(attachment.width / 2), -(attachment.height / 2), attachment.width, attachment.height);
        
        context.restore();
    }
};

// spine asset loader
(function () {
    var object = {};
    // makes a GET request to each file in the files array
    // files {array}, options { teams {array}, onlaod {function} }
    boc.spine.loadSpineAssets = function (files, options) {
        if (!options) {
            options = {
                teams: ['']
            };
        }

        var batchMult = 2 + options.teams.length; // +1 for each team given
        var fileTotal = batchMult * files.length;
        var filesLoaded = 0;
        
        var checkComplete = function () {
            if (filesLoaded == fileTotal) {
                if (options.onload) {
                    options.onload(object);
                }
            }
        }

        // this loop loads the .atlas .json .png files
        // when complete, gives back an object with the asset name as the key
        // ideally would be pushed onto the SkeletonManager to load
        for (var i = 0; i < files.length; i++) {

            var assetName = files[i].substring(files[i].lastIndexOf('/') + 1);
            var alreadyLoaded = false;
            for (var j = 0; j < options.teams.length; j++) {
                var newName = assetName + '_' + options.teams[j];
                if (!object[newName]) {
                    object[newName] = {};
                } else {
                    alreadyLoaded = true;
                    continue;
                }
            }

            if (alreadyLoaded) {
                filesLoaded += batchMult;
                checkComplete();
                continue;
            }

            (function (aname, fpath) {
                var directory = fpath.substring(0, fpath.lastIndexOf('/')) + '/';
                $.get(files[i] + '.atlas', function (data) {
                    for (var j = 0; j < options.teams.length; j++) {
                        var newName = aname + '_' + options.teams[j];
                        object[newName].atlas = data.replace(/(\w+).png/, directory + '$1_' + options.teams[j] + '.png');
                    }
                    filesLoaded++;
                    checkComplete();
                });
                $.get(files[i] + '.json', function (data) {
                    var json = typeof(data) == 'object' ? data : JSON.parse(data);
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
    }; //loadSpineAssets
})();