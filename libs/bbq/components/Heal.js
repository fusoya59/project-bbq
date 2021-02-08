ns('bbq.components');
// p : heal points
bbq.components.Heal = function (p) {
    this.points = p;
    this.className = function () {
        return 'Heal';
    };
};