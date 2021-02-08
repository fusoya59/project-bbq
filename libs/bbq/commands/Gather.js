ns('bbq.commands');
bbq.commands.Gather = function (em) {
    this.name = function () { return 'Gather'; }
    this.execute = function (p) {
        // hide the ring view
        var entSpatial = $em(p.entity).comp('Spatial');
        var entMapElem = $em(p.entity).comp('MapElement');
        var entGather = $em(p.entity).comp('Gather');
        var gatherTarget = p.map.getEntities(entMapElem.x, entMapElem.y, 'Gatherable');
        if (gatherTarget && gatherTarget.length > 0 /*&& !entGather*/) {
            gatherTarget = gatherTarget[0];
        } else {
            return; // nothing to gather
        }
        if (!entGather) {
            var gatherIcon = $em.create('gatherIcon');
            $em(gatherIcon)
                .add(new boc.components.Spatial({ x: entSpatial.x, y: entSpatial.y + entSpatial.height - 15, z: bbq.zindex.UNITS + 1, width: 15, height: 15 }))
                .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('assets/Misc/icon_gather.png'), visible: true }));

            entSpatial._onGatherMoved = function () {
                $em(p.entity).remove('Gather');
            };
            entSpatial.addListener('onchange', entSpatial._onGatherMoved);

            $em(p.entity)
                .add(new bbq.components.Gather(gatherTarget, gatherIcon))
                .listen('onComponentRemoved', function (evArg) { // this is also invoked when entity is killed
                    if (evArg.componentName == 'Gather') {
                        if ($em(gatherIcon).exists()) {
                            $em(gatherIcon).kill();
                        }
                        entSpatial.removeListener('onchange', entSpatial._onGatherMoved);
                        delete entSpatial['_onGatherMoved'];
                    }
                });
        }
        if (!p.showIconOnly) {
            var gmap = $em(p.entity).comp('MapElement');
            boc.utils.getCurrentPlayer(em).moves.push('(' + gmap.x + ',' + gmap.y + ')g');
            //boc.utils.createEvent(new bbq.events.SaveEvent('saveAll'), em);
            bbq.commands.endUnitTurn(p.entity);
        }
		
        var audio = bbq.sh().getAudio(p.entity, 'unitGather');
		bbq.sh().play(audio);
        
        if (p.command && p.command.onGatherEnd) {
        	p.command.onGatherEnd();
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
        var propEnts = p.map.getEntities(mapElement.x, mapElement.y, 'Prop');
        for (var i = 0; i < propEnts.length; i++) {
            if (em.getComponentForEntity('Prop', propEnts[i]).type == 'berries') {
                return _disabled;
            }
        }
        return true;
    } //disabled
};