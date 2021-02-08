ns('boc.components');

// identifiedEntities {array}
boc.components.IdentifyEvent = function(obj) {
    this.identifiedEntities = obj.identifiedEntities;
    this.className = function () { return 'IdentifyEvent'; }
};