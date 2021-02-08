ns('bbq.systems');

bbq.systems.TrainingSystem = function (em, camera, map, p) {
    if (!p) { p = {}; }
    if (!p.scale) { p.scale = 1.0; }
    var state = 'closed'; // closed, opened

    p.hud.on('trainback', function () {
        if (!p.hud._dontShowCommands) {
            boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'showCommands', args: { entity: p.hud._trainingEntity } }), em);
        }
        boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
        boc.utils.createEvent(new boc.components.PanningCameraEvent('unlock'), em);
        p.hud.hideUnitStats();
		p.hud._trainingEntity = null;
        p.hud._dontShowCommands = null;
        //document.ontouchmove = null;
        document.addEventListener('touchmove', p.touchCallback);
    });

    p.hud.on('trainok', function (k) {
        if (k.selected) {
            var unitType = k.selected;
            var unitConfig = bbq.units.configuration[unitType];
            var player = boc.utils.getCurrentPlayer(em);
            if (player.food >= unitConfig.foodCost) {
                player.updateFood(player.food - unitConfig.foodCost);
                var currProduced = player.summary.unitsProduced || 0;
                player.updateSummary({ unitsProduced: currProduced + 1 });
                var unit = bbq.units.createUnit({ type: unitType }, player.team, em);
                player.addUnit(unit);
                var buildingMapElement = $em(p.hud._trainingEntity).comp('MapElement');
                map.place(unit, buildingMapElement.x, buildingMapElement.y);
                boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
                boc.utils.createEvent(new boc.components.PanningCameraEvent('unlock'), em);
                boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: unit } }), em);
                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
                boc.utils.createEvent(new bbq.events.HudEvent({ action: 'update' }), em);
                boc.utils.getCurrentPlayer().moves.push('(' + buildingMapElement.x + ',' + buildingMapElement.y + ')t(\'' + unitType + '\')');
                p.hud._dontShowCommands = true;
                p.hud.closeTrainWindow();

				var audio = bbq.sh().getAudio(unit, 'unitTrain');
				bbq.sh().play(audio);

            }
            else {
                alert('Not enough food!');
            }
        } else {
            alert('no unit selected!');
        }
    });

    this.processTick = function (frameTime) {
        $em('TrainingEvent').each(function (e, c) {
            if (c.action == 'show') {
                p.hud.openTrainWindow(boc.utils.getCurrentPlayer().unitSet);
                p.hud._trainingEntity = c.entity;
                boc.utils.consumeEvent(e, c.className(), em);
                var bcallback = function (e) {
                    e.preventDefault();
                };
                document.removeEventListener('touchmove', p.touchCallback);
            }
            //if (c.action == 'show') {
            //    boc.utils.createEvent(new boc.components.PanningCameraEvent('lock'), em);
            //    var options = {
            //        x : (camera.xmax - camera.xmin) / 2 - 210,
            //        y: (camera.ymax - camera.ymin) / 2 - 112,
            //        onTrainClick : function(ent, unitType) {
            //            // TODO: bonuses
            //            var unitConfig = bbq.units.configuration[unitType];
            //            var player = boc.utils.getCurrentPlayer(em);
            //            if (player.food >= unitConfig.foodCost) {
            //                player.updateFood(player.food - unitConfig.foodCost);
            //                var currProduced = player.summary.unitsProduced || 0;
            //                player.updateSummary({ unitsProduced: currProduced + 1 });
            //                var unit = bbq.units.createUnit({ type: unitType }, player.team, em);
            //                player.addUnit(unit);
            //                var buildingMapElement = $em(c.entity).comp('MapElement');
            //                map.place(unit, buildingMapElement.x, buildingMapElement.y);
            //                $em(trainingWindow).kill();
            //                state = 'closed';
            //                boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
            //                boc.utils.createEvent(new boc.components.PanningCameraEvent('unlock'), em);
            //                boc.utils.createEvent(new bbq.events.UnitEvent({ action: 'inactivate', args: { entity: unit } }), em);
            //                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'update' }), em);
            //                boc.utils.createEvent(new bbq.events.FogEvent({ action: 'draw' }), em);
            //                boc.utils.getCurrentPlayer().moves.push('(' + buildingMapElement.x + ',' + buildingMapElement.y + ')t(\'' + unitType + '\')');
            //            }
            //            else {
            //                // TODO: change alert
            //                alert('Not enough food!');
            //            }
            //        },
            //        onBackClick : function(ent) {
            //            var event = new bbq.events.TrainingEvent('hide');
            //            event.window = ent;
            //            boc.utils.createEvent(event, em);
            //            boc.utils.createEvent(new bbq.events.CommandEvent({ action: 'showCommands', args: { entity: c.entity } }), em);
            //            boc.utils.createEvent(new bbq.events.MapSelectEvent({ action: 'unlockCursor' }), em);
            //            boc.utils.createEvent(new boc.components.PanningCameraEvent('unlock'), em);
            //        },
            //        scale : p.scale
            //    };
            //    var trainingWindow = bbq.ui.createTrainingWindow(camera, options);                
            //    boc.utils.consumeEvent(e, c.className(), em);
            //    state = 'opened';
            //}
            //else if (c.action == 'hide') {
            //    $em(c.window).kill();
            //    boc.utils.consumeEvent(e, c.className(), em);
            //    state = 'closed';
            //}
        });
    }; // processTick
}; //TrainingSystem