ns('boc.core');

// interface
boc.core.Component = function () {
    this.className = function () { return null; }
}; // Component


ns('boc.components');

// list of drawable components
// if for some strange reason an entity has more than one drawable component
// then the first one wins
boc.components.drawables = [
    'DrawableRect',
    'FunkyDrawableRect',
    'DrawableSprite',
    'DrawableText',
    'SpineDrawable'
];