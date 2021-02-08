ns('bbq.components');
// entityId {string}
bbq.components.PlayerStats = function (p) {
    this.className = function () { return 'PlayerStats'; }

    var _em = new boc.utils.EventManager();
    var _target = p;
    this.target = function (t) {
        if (typeof (t) == 'undefined') { return _target; }
        if (_target == t) { return; }
        var oldTarget = _target;
        _target = t;
        _em.notify('onTargetChange', { oldTarget: oldTarget, newTarget: t });
    };// target       

    this.addListener = _em.addListener;
    this.removeListener = _em.removeListener;
};