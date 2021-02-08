ns('boc.components');

// Like set timeout, but within the game loop. So if the game loop is twice as fast, the delayed
// method corresponds to that speed
// p/run {function}, q/delay {number}
boc.components.DelayedMethod = function (p, q) {
    if ($.isFunction(p) && !isNaN(q)) {
        this.run = p;
        this.delay = q;
    }
    else {
        this.run = p.run;
        this.delay = p.delay;
    }

    this.elapsed = 0;
    this.className = function () { return 'DelayedMethod'; }
};