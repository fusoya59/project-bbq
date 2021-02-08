ns('boc.components');

boc.components.WaitForClick = function (p) {
    if ($.isFunction(p)) {
        this.run = p;
    }
    else {
        this.run = p.run;
    }
	
	this.timestamp = +new Date();
    this.className = function () { return 'WaitForClick'; }
};