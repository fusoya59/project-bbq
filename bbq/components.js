if (!window.bbq) { window.bbq = {}; }

// interface for a stateful thing
bbq.iStatefulComponent = function () {
    this.serialize = function () { return {}; }
}; // iStatefulComponent

bbq.components = {
    // id {string}, team {string}, food {int}, turn {int}, upkeep {bool}, buildings {array}, units {array}, lastSeen {object}, visibleMapTiles {array}, summary {object}
    Player: function (p) {
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
    },

    // entityId {string}
    UnitStats: function (p) {
        this.className = function () { return 'UnitStats'; }

        var _target = p;
        var _em = new boc.utils.EventManager();
        this.target = function (t) {
            if (typeof(t) == 'undefined') { return _target; }
            //if (_target == t) { return; }
            var oldTarget = _target;
            _target = t;
            _em.notify('onTargetChange', { oldTarget: oldTarget, newTarget: t });
        };// target

        this.addListener = _em.addListener;
        this.removeListener = _em.addListener;
    }, //UnitStats    

    // entityId {string}
    PlayerStats: function (p) {
        this.className = function () { return 'PlayerStats'; }

        var _em = new boc.utils.EventManager();
        var _target = p;
        this.target = function (t) {
            if (typeof (t) == 'undefined') { return _target; }
            if (_target == t) { return; }
            var oldTarget = _target;
            _target = t;
            _em.notify('onTargetChange', { oldTarget: oldTarget, newTarget: t });
        };// target       

        this.addListener = _em.addListener;
        this.removeListener = _em.removeListener;
    }, //PlayerStats

    BuilingStats : function(p) {

    }, //BuilingStats

    // blue arrows, heading
    PathArrow: function (p) {
        this.heading = p; // n, s, e, w
        this.className = function () { return 'PathArrow'; }
    },

    PathAnchor: function (p) {
        this.path = []; // entities
        this.className = function () { return 'PathAnchor'; }
    }, // PathAnchor

    // gold arrows, heading
    MoveArrow: function (p) {
        this.heading = p; // n, s, e, w
        this.className = function () { return 'MoveArrow'; }
    },

    Fog : function (obj) {
        this.className = function () { return 'Fog'; }
    },

    AttackOverlay: function (p) {
        this.className = function () { return 'AttackOverlay'; }
    }, //AttackOverlay

    MoveOverlay: function (p) {
        this.className = function () { return 'MoveOverlay'; }
    }, //MoveOverlay

    // commands {array}
    Commandable: function (obj) {
        this.commands = obj.commands || [];
        this.className = function () { return 'Commandable'; }
    }, //Commandable

    CommandRing: function () {
        this.className = function () { return 'CommandRing'; }
    }, // CommandRing

    // foodCost {int}
    Trainable: function (obj) {
        this.foodCost = obj.foodCost;
        this.className = function () { return 'Trainable'; }
    },

    TrainingUnit: function (p) {
        this.type = p;
        this.className = function () { return 'TrainingUnit'; }
    },

    Buffable : function(obj) {
        this.className = function () { return 'Buffable'; }
    },

    Debuffable : function(obj) {
        this.className = function () { return 'Debuffable'; }
    },

    // minRange {int}, maxRange {int}, damage {int}
    Retaliate : function (obj) {
        this.minRange = obj.minRange;
        this.maxRange = obj.maxRange;
        this.damage = obj.damage;
        this.className = function () { return 'Retaliate'; }
    },

    // minRange {int}, maxRange {int}, damage {int}
    Attack : function (obj) {
        this.minRange = obj.minRange;
        this.maxRange = obj.maxRange;
        this.damage = obj.damage;
        this.className = function () { return 'Attack'; }
    },

    // range {int}
    Vision : function (obj) {
        this.range = obj.range;
        this.className = function () { return 'Vision'; }
    },

    // range {int}, velocity {int}, bonus {function(tileType)}
    Movement : function (obj) {
        this.range = obj.range;
        this.velocity = obj.velocity || 200; // ms per tile
        this.bonus = obj.bonus;
        this.className = function () { return 'Movement'; }
    },

    // current {int}, max {int}
    Health : function (obj) {
        this.current = obj.current;
        this.max = obj.max;
        this.className = function () { return 'Health'; }
    },

    // type {string}
    Prop : function(obj) {
        this.type = obj.type;
        this.className = function () { return 'Prop'; }
    },
    
    // cost {int}
    MoveCostNode: function (c) {
        this.cost = c;
        this.className = function () { return 'MoveCostNode'; }
    },

    // cost {int}
    VisionCostNode: function (c) {
        this.cost = c;
        this.className = function () { return 'VisionCostNode'; }
    },

    // cost {int}
    AttackCostNode: function (c) {
        this.cost = c;
        this.className = function () { return 'AttackCostNode'; }
    },

    // type {string}
    Terrain : function(obj) {
        this.type = obj.type;
        this.className = function () { return 'Terrain'; }
    },
    
    // x {int}, y {int}
    MapElement: function (obj) {
        this.x = obj.x;
        this.y = obj.y;
        this.className = function () { return 'MapElement'; }
    }, //MapElement

    // playerid {string}, number {int}
    Turn: function (p) {
        this.playerid = p.playerid;
        this.number = p.number;        
        this.className = function () { return 'Turn'; }      
    },//Turn
    
    Cursor : function() {
        this.className = function () { return 'Cursor'; }
    },

    // type {string}, state {string}, level {int}, kills {int}
    Unit: function (obj) {
        this.type = obj.type;
        this.state = obj.state || 'idle';
        this.level = obj.level || 1;
        this.kills = obj.kills || 0;
        this.className = function () { return 'Unit'; }        
    }, //Unit

    // type {string}, turnsUntilCapture {int}
    Building: function (obj) {
        this.type = obj.type;
        this.turnsUntilCapture = obj.turnsUntilCapture;
        this.className = function () { return 'Building'; }        
    }, //Building

    // food {int}
    FoodProducer: function (obj) {
        this.food = obj.food;
        this.className = function () { return 'FoodProducer'; }
    }, //FoodProducer 

    // dx {number}, dy {number}, easing {string}, height {int}, duration {number}
    ParabolicTranslationAnimation: function (obj) {
        this.dx = obj.dx;
        this.dy = obj.dy;
        this.easing = obj.easing || 'linearTween';
        this.height = obj.height || 70;
        this.duration = obj.duration;
        this.elapsedTime = 0;
        this.state = obj.state || boc.constants.ANIMATION_STOPPED;
        this.className = function () { return 'ParabolicTranslationAnimation'; }

        var _em = new boc.utils.EventManager;
        this.notify = _em.notify;
        this.addListener = _em.addListener;
        this.removeListener = _em.removeListener;
    } //ParabolicTransationAnimation

}; // components

bbq.events = {
    UnitEvent: function (p) {
        this.action = p.action;
        this.args = p.args;
        this.timeStamp = +new Date;
        this.className = function () { return 'UnitEvent'; }
    }, //UnitEvent

    CommandEvent: function (p) {
        this.action = p.action;
        this.args = p.args;
        this.timeStamp = +new Date;
        this.className = function () { return 'CommandEvent'; }
    }, //CommandEvent

    
    FogEvent: function (p) {
        this.action = p.action;
        this.forPlayer = p.forPlayer;
        this.args = p.args;
        this.timeStamp = +new Date;
        this.className = function () { return 'FogEvent'; }
    }, //FogEvent

    MapSelectEvent: function (p) {
        this.action = p.action;
        this.args = p.args;
        this.timeStamp = +new Date;
        this.className = function () { return 'MapSelectEvent'; }
    }, //MapSelectEvent

    HudEvent: function (p) {        
        this.action = p.action;
        this.entity = p.entity;
        this.className = function () { return 'HudEvent'; }
    }
}; // events

bbq.events.TrainingEvent = function (p)  {
    this.action = p;
    this.className = function () { return 'TrainingEvent'; }
}

// p = action : [ 'saveAll', 'saveMoves', 'saveGameState' ], q = playerid, r = onSavecomplete
bbq.events.SaveEvent = function (p, q, r) {
    this.action = p;
    this.playerid = q;
    this.onSaveComplete = r;
    this.className = function () { return 'SaveEvent'; }
}

// p = type, q = player
bbq.events.VictoryEvent = function (p, q) {
    this.type = p;
    this.player = q;
    this.className = function () { return 'VictoryEvent'; }
}

bbq.components.Gather = function (p, q) {
    this.target = p;
    this.icon = q;
    this.className = function () { return 'Gather'; }
}

bbq.components.Gatherable = function (p) {
    this.foodPerTurn = p;
    this.className = function () { return 'Gatherable'; }
}

bbq.components.Capture = function (p, q) {
    this.target = p;
    this.icon = q;
    this.className = function () { return 'Capture'; }
}

bbq.components.HealthBar = function (p) {
    this.icon = p;
    this.className = function () { return 'HealthBar'; }
}