ns('bbq.components');
// foodCost {int}
bbq.components.Trainable = function (obj) {
    this.foodCost = obj.foodCost;
    this.className = function () { return 'Trainable'; }
};