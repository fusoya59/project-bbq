// hash table containing SpriteAnimations
// p {object} sprite name to SpriteAnimation dictionary
ns('boc.components');
boc.components.SpriteAnimationSet = function (p) {
    for (var n in p) {
        this[n] = p; // should be SpriteAnimation components
    }
    this.className = function () { return 'SpriteAnimationSet'; }
};