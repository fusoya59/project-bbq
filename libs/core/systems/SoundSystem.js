ns('boc.systems');
boc.systems.SoundSystem = function (em) {
    this._em = em;
};

boc.systems.SoundSystem.prototype = {
    processTick: function (frameTime) {
        $em('AudioScript').each(function (e, c) {
            c.run();
            boc.utils.consumeEvent(e, c.className(), _this._em);
        });
    } //processTick
}; //prototype 