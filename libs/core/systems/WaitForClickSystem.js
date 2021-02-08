// JavaScript Document
ns('boc.systems');

// captures all javascript mouse events and injects it to the system
boc.systems.WaitForClickSystem = function (entityManager, canvas) {
	var em = entityManager;
	this.processTick = function () {
		var ents = $em('WaitForClick').all();
		var toKill = null;
		
		if (ents.length > 0) {
			$em('MouseEvent').each(function (mouseEnt, mouseComp) {
				if (mouseComp.action == 'mouseup') {
					$em('WaitForClick').each(function (waitEnt, waitComp) {
						if (mouseComp.timestamp > waitComp.timestamp) {
							waitComp.run();
							if (!toKill) { toKill = []; }
							toKill.push(waitEnt);
						}
					});
				}
			});
		}
		
		if (toKill) {
			while (toKill.length > 0) {
                $em(toKill.pop()).kill();
            }
		}
	}
}