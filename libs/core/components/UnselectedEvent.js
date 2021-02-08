// Occurs immadiately when the cursor is off the selected entity
// {string}
ns('boc.components');
boc.components.UnselectedEvent = function (obj) {
    this.target = obj;
    this.className = function () { return 'UnselectedEvent'; }
};