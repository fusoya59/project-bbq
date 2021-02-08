ns('bbq.components');
// id {string}, team {string}, food {int}, turn {int}, upkeep {bool}, buildings {array}, units {array}, lastSeen {object}, visibleMapTiles {array}, summary {object}
bbq.components.Player = function (p) {
    this.id = p.id;
    this.team = p.team;
    this.food = p.food;  // current food
    this.turn = p.turn;
    this.upkeep = p.upkeep;
    this.buildings = p.buildings;
    this.units = p.units;
    this.lastSeen = p.lastSeen || {}; // { "x,y" : "Red" }
    this.visibleMapTiles = p.visibleMapTiles || []; // [ "x,y" ]
    this.summary = p.summary;
    this.moves = []; // array
    this.unitSet = p.unitSet;

    this.className = function () { return 'Player'; }
        

    var _em = new boc.utils.EventManager();
    this.addListener = _em.addListener;
    this.removeListener = _em.removeListener;

    this.updateFood = function (f) {
        var oldVal = this.food;
        if (oldVal == f) { return; }
        this.food = f;
        _em.notify('onFoodChange', { oldFood: oldVal, newFood: f });
        var d = f - oldVal; 
                        
        if (d > 0) {
            var oldFoodCollected = this.summary.foodCollected || 0;
            this.updateSummary({ foodCollected: oldFoodCollected + d });
        }
        else {
            var oldFoodConsumed = this.summary.foodConsumed || 0;
            this.updateSummary({ foodConsumed: oldFoodConsumed - d });
        }
    };

    this.updateTurn = function (t) {
        var oldVal = this.turn;
        if (oldVal == t) { return; }
        this.turn = t;
        _em.notify('onTurnChange', { oldTurn: oldVal, newTurn: t });
    };

    this.addUnit = function (u) {
        this.units.push(u);
        _em.notify('onUnitsUpdated', { event: 'add', unit: u });
        var oldUnitsProduced = this.summary.unitsProduced || 0;
        this.updateSummary({ unitsProduced: oldUnitsProduced + 1 });            
    };

    this.removeUnit = function (u) {
        var idx = this.units.indexOf(u);
        if (idx == -1) { throw 'Unit not found'; }
        this.units.splice(idx, 1);
        _em.notify('onUnitsUpdated', { event: 'remove', unit: u });
        var oldUnitsLost = this.summary.unitsLost || 0;
        this.updateSummary({ unitsProduced: oldUnitsLost + 1 });

    };

    this.addBuilding = function (b) {
        this.buildings.push(b);
        _em.notify('onBuildingsUpdated', { event: 'add', building : b });
        var oldBuildingsCaptured = this.summary.buildingsCaptured || 0;
        this.updateSummary({ buildingsCaptured: oldBuildingsCaptured + 1 });
    };

    this.removeBuilding = function (b) {
        var idx = this.buildings.indexOf(b);
        if (idx == -1) { throw 'Building not found'; }
        this.buildings.splice(idx, 1);
        _em.notify('onBuildingsUpdated', { event: 'remove', building: b });
        var oldBuildingsLost = this.summary.buildingsLost || 0;
        this.updateSummary({ buildingsLost: oldBuildingsLost + 1 });
    };

    this.updateSummary = function (upArgs) {
        for (var i in upArgs) {
            if (this.summary[i] == undefined || this.summary[i] == null) {
                this.summary[i] = 0;
            }
            var oldVal = this.summary[i];
            var newVal = upArgs[i];
            if (oldVal == newVal) { continue; }
            this.summary[i] = newVal;
            _em.notify('onSummaryChange', { propertyName: i, oldValue: oldVal, newValue: newVal });
        } //i
    }; //updateSummary/

    this.hasEntity = function (ent) {
        return this.units.indexOf(ent) >= 0 || this.buildings.indexOf(ent) >= 0;
    }; //         
};