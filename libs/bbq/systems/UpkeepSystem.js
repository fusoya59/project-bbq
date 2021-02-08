ns('bbq.systems');

bbq.systems.UpkeepSystem = function (em) {
    this.processTick = function (frameTime) {
        var currPlayer = boc.utils.getCurrentPlayer();
        if (!currPlayer.upkeep && currPlayer.turn > 1 &&
            SharedSession && SharedSession.user && SharedSession.user.playerid == currPlayer.id) {
            // update foods
            var totalFood = 0;
            $em('FoodProducer').each(function (e, c) {
                if (currPlayer.hasEntity(e)) {
                    totalFood += c.food;
                    var spatial = $em(e).comp('Spatial');
                    var textDrawable = new boc.components.DrawableText({ text: c.food, fillStyle: 'white', shadow: { x: 1, y: 1 }, font: 'bold 10pt Helvetica' });
                    //var foodDrawable = new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage("assets/UI/UnitTraining/iconFood.png"), visible: true });
                    var foodDrawable = new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('ui/images/icon_food_small.png'), visible: true });

                    //if (SharedSession && SharedSession.user && SharedSession.user.playerid == currPlayer.id) {
                    boc.utils.createScrollingDrawable(textDrawable, spatial.x + spatial.width / 2, spatial.y + spatial.height / 2 + 11, { easing: 'easeOutQuad', duration: 1300 });
                    boc.utils.createScrollingDrawable(foodDrawable, spatial.x + spatial.width / 2 - 10, spatial.y + spatial.height / 2, { easing: 'easeOutQuad', duration: 1300 });
                    //}
                }
            });

            $em('Gather').each(function (e, c) {
                if (currPlayer.hasEntity(e)) {
                    var gatherableEnt = c.target;
                    var food = $em(gatherableEnt).comp('Gatherable').foodPerTurn;
                    totalFood += food;
                    var spatial = $em(e).comp('Spatial');
                    var textDrawable = new boc.components.DrawableText({ text: food, fillStyle: 'white', shadow: { x: 1, y: 1 }, font: 'bold 10pt Helvetica' });
                    //var foodDrawable = new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage("assets/UI/UnitTraining/iconFood.png"), visible: true });
                    var foodDrawable = new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage('ui/images/icon_food_small.png'), visible: true });

                    //if (SharedSession && SharedSession.user && SharedSession.user.playerid == currPlayer.id) {
                    boc.utils.createScrollingDrawable(textDrawable, spatial.x + spatial.width / 2, spatial.y + spatial.height / 2 + 11, { easing: 'easeOutQuad', duration: 1300 });
                    boc.utils.createScrollingDrawable(foodDrawable, spatial.x + spatial.width / 2 - 10, spatial.y + spatial.height / 2, { easing: 'easeOutQuad', duration: 1300 });
                    //}
                }
            });

            currPlayer.updateFood(currPlayer.food + totalFood);
            currPlayer.upkeep = true;
            boc.utils.createEvent(new bbq.events.HudEvent({ action: 'update' }), em);
            // TODO: buff ticks
            // TODO: debuff ticks
        }
    }
};