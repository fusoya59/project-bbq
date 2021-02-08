ns('bbq.commands');
bbq.commands.Capture = function (em) {
    this.name = function () { return 'Capture'; }
    this.execute = function (p) {
        // hide the ring view
        var entSpatial = $em(p.entity).comp('Spatial');
        var entMapElem = $em(p.entity).comp('MapElement');
        var entCapture = $em(p.entity).comp('Capture');
        var captureTarget = p.map.getEntities(entMapElem.x, entMapElem.y, 'Building');
        if (captureTarget && captureTarget.length > 0) {
            captureTarget = captureTarget[0];
        } else {
            //boc.utils.createEvent(
            //    new bbq.events.CommandEvent({ action: 'showCommands', args: { entity: p.entity } }),
            //    em
            //);
            return; // no building to capture
        }

        var building = $em(captureTarget).comp('Building');
        if (!entCapture) {
            var captureIcon = $em.create('captureIcon');
            $em(captureIcon)
                .add(new boc.components.Spatial({ x: entSpatial.x, y: entSpatial.y + entSpatial.height - 15, z: bbq.zindex.UNITS + 1, width: 15, height: 15 }))
                .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('assets/Misc/icon_capture.png'), visible: true }));

            entSpatial._onCaptureMoved = function () {
                $em(p.entity).remove('Capture');
            };
            entSpatial.addListener('onchange', entSpatial._onCaptureMoved);
            entCapture = new bbq.components.Capture(captureTarget, captureIcon);
            $em(p.entity)
                .add(entCapture)
                .listen('onComponentRemoved', function (evArg) {
                    if (evArg.componentName == 'Capture') {
                        if ($em(captureIcon).exists()) {
                            $em(captureIcon).kill();
                        }
                        building.turnsUntilCapture = bbq.buildings.configuration[building.type].turnsTilCap;
                        entSpatial.removeListener('onchange', entSpatial._onCaptureMoved);
                        delete entSpatial['_onCaptureMoved'];
                    }
                });
        }

        if (building && !p.showIconOnly) {
            var capPoint = 1; // TODO: bonuses
            building.turnsUntilCapture -= capPoint;
            if (building.turnsUntilCapture <= 0) {
                $em(entCapture.icon).kill();
                $em(p.entity).remove('Capture');
                building.turnsUntilCapture = bbq.buildings.configuration[building.type].turnsTilCap;
                //remove this from the opposing player
                $em('Player').each(function (e, c) {
                    if (c.hasEntity(captureTarget)) {
                        c.removeBuilding(captureTarget);
                    }
                });

                //add this to capturing player's buildings and recolor
                var currPlayer = boc.utils.getCurrentPlayer(em);
                currPlayer.addBuilding(captureTarget);
                $em(captureTarget).comp('DrawableSprite').image = boc.resources.GraphicsManager.getImage(bbq.buildings.configuration[building.type].defaultImagePath.replace('$(team)', currPlayer.team.toLowerCase()));

                // throw a victory event in case it was an HQ cap
                boc.utils.createEvent(new bbq.events.VictoryEvent('captureHQ', currPlayer.id), em);
            }
            var gmap = $em(p.entity).comp('MapElement');
            boc.utils.getCurrentPlayer(em).moves.push('(' + gmap.x + ',' + gmap.y + ')c');
            //boc.utils.createEvent(new bbq.events.SaveEvent('saveAll'), em);
            bbq.commands.endUnitTurn(p.entity);

            if (p.command && p.command.onCaptureEnd) {
                p.command.onCaptureEnd();
            }
        }
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
        var mapElement = em.getComponentForEntity('MapElement', p.entity);
        var buildingEnts = p.map.getEntities(mapElement.x, mapElement.y, 'Building');
        var currentPlayer = boc.utils.getCurrentPlayer(em);
        var allPlayers = $em('Player').all();
        if (buildingEnts && buildingEnts.length > 0) { // enable if this building belongs to another player
            for (var i = 0; i < allPlayers.length; i++) {
                var otherPlayer = $em(allPlayers[i]).comp('Player');
                if (otherPlayer.id != currentPlayer.id) {
                    if (otherPlayer.buildings.indexOf(buildingEnts[0]) >= 0) {
                        return _disabled;
                    }
                }
            } //i
        }
        //if (currentPlayer) {
        //    for (var i = 0; i < buildingEnts.length; i++) {
        //        if (currentPlayer.units.indexOf(buildingEnts[i]) >= 0) {
        //            return _disabled;
        //        }
        //    } // i
        //}
        return true;
    }
};