// food {int}
ns('bbq.components');
bbq.components.FoodProducer = function (obj) {
    this.food = obj.food;
    this.className = function () { return 'FoodProducer'; }
};