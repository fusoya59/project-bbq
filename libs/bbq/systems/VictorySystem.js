ns('bbq.systems');

bbq.systems.VictorySystem = function (gameObj, em) {
    this.processTick = function () {
        $em('VictoryEvent').each(function (e, c) {
            if (gameObj.victoryCondition) {
                gameObj.victoryCondition(gameObj, c);
            }
            boc.utils.consumeEvent(e, 'VictoryEvent', em);
        });
    }
}; // VictorySystem