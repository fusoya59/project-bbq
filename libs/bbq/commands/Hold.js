ns('bbq.commands');
bbq.commands.Hold = function (em) {
    this.name = function () { return 'Hold'; }
    this.execute = function (p) {
        em.getComponentForEntity('Unit', p.entity).state = 'inactive';
        boc.utils.createEvent(
            new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: p.entity } }),
            em
        );
        boc.utils.createEvent(
            new bbq.events.MapSelectEvent({ action: 'unlockCursor' }),
            em
        );
        var mapEle = $em(p.entity).comp('MapElement');
        boc.utils.getCurrentPlayer(em).moves.push('(' + mapEle.x + ',' + mapEle.y + ')h');
        if (p.command && p.command.onHoldEnd) {
        	p.command.onHoldEnd();
        }
        //boc.utils.createEvent(new bbq.events.SaveEvent('saveAll'), em);
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