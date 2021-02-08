/// <reference path="../core/components.js" />
/// <reference path="../core/constants.js" />
/// <reference path="../core/utils.js" />
/// <reference path="./spine-js_files/spine.js" />

// depends on spine.js

var boc = boc || {};
boc.spine = boc.spine || {};

boc.spine.SkeletonManager = new function SkeletonManager() {
    var atlases_ = {};
    var skeletonData_ = {};

    this.load = function (p, onLoaded) {
        for (var skeletonName in p) {
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
    };

    this.getSkeletonData = function (p) {
        return skeletonData_[p];
    }

    this.createSkeleton = function (p) {
        var sdata = skeletonData_[p];
        if (sdata) {
            var skeleton = new spine.Skeleton(sdata);
            skeleton.getRootBone().x = 0;
            skeleton.getRootBone().y = 0;
            skeleton.updateWorldTransform();
            return skeleton;
        }
    };
};

boc.spine.AnimationStateManager = new function AnimationStateManager() {
    var animationStateData_ = {};

    this.getAnimationData = function (p) {
        return skeletonData_[p];
    };
    this.setAnimationData = function (p, q) {
        animationStateData_[p] = q;
    };
};

boc.spine.SpineDrawable = function SpineDrawable(p) {
    this.skeleton = p.skeleton;
    this.visible = p.visible;
    this.className = function () {
        return 'SpineDrawable';
    }
};

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
};

boc.spine.SpineAnimationSystem = function () {
    this.processTick = function (lastFrameTime) {
        $em('SpineAnimation').each(function (e, c) {
            if (c.target) {
                var spineDrawable = $em(c.target).comp('SpineDrawable');
                if (c.state == boc.constants.ANIMATION_PLAYING) {
                    c.animationState.update(lastFrameTime / 1000); // takes in seconds
                    c.animationState.apply(spineDrawable.skeleton);
                    spineDrawable.skeleton.updateWorldTransform();
                }
            }
        });
    };
};

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
    //console.log(drawOrder.length);
    for (var i = 0; i < drawOrder.length; i++) {
        var slot = drawOrder[i];
        var attachment = slot.attachment;
        if (!(attachment instanceof spine.RegionAttachment)) {
            continue;
        }

        context.save();
        

        //transformBones(slot.bone);
        context.translate(slot.bone.worldX, slot.bone.worldY);
        context.rotate(slot.bone.worldRotation * Math.PI / 180);
        context.scale(slot.bone.worldScaleX, slot.bone.worldScaleY);

        context.translate(attachment.x, attachment.y);
        context.rotate(attachment.rotation * Math.PI / 180);
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