// commands {array}
ns('bbq.components');
bbq.components.Commandable = function (obj) {
    this.commands = obj.commands || [];
    this.className = function () { return 'Commandable'; }
};