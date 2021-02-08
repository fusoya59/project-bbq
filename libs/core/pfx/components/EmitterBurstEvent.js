ns('boc.pfx.components');

// emit particles all at once
// target {string} entity id, count {int} # of particles
boc.pfx.components.EmitterBurstEvent = function (obj) {
    this.target = obj.target;
    this.count = obj.count;
    this.className = function () { return 'EmitterBurstEvent'; }
};