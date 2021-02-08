ns('bbq.commands');
bbq.commands.endUnitTurn = function (unitEnt, em) {
    if (!em) { em = $em(); }
    boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
    boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'showCursor' }), em);
    boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: unitEnt } }), em);
};