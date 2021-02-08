ns('bbq.commands');
bbq.commands.Train = function (em) {
    this.name = function () { return 'Train'; }
    this.execute = function (p) {
        var event = new bbq.events.TrainingEvent('show');
        event.entity = p.entity;
        boc.utils.createEvent(event, em);
        boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'hideCommands' }), em);
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
    }; //disabled
};