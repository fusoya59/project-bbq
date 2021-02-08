ns('bbq.commands');
bbq.commands.Move = function (em) {
    this.name = function () { return 'Move'; }
    this.execute = function (p) {
        boc.utils.createEvent(
            new bbq.events.CommandEvent({ action: 'moveMode', args: p }),
            em
        );
    };
    var _disabled = false;
    this.disabled = function (p) {
        if (p === true) {
            _disabled = true;
            return _disabled;
        }
        if (p === false) {
            _disabled = false;
            return _disabled;
        }
        return _disabled;
    }
};