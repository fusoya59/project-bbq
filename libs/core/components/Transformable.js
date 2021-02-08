ns('boc.components');
// Series of transforms
// transforms {array}
boc.components.Transformable = function (p) {
    this.transforms = p || []; // given a context
    this.className = function () { return 'Transformable'; }
}; //Transformable