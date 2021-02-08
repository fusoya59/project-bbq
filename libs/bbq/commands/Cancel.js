ns('bbq.commands');
bbq.commands.Cancel = function (em) {
    this.name = function () { return 'Cancel'; }
    this.execute = function (p) {
        // hide the ring view
    };
};