// Unit configuration
ns('bbq.units.configuration');

// this is the loadout of units that each player always starts with
bbq.units.configuration.baseLoadout = [
    'SpearWarrior',
    'DartBlower',
    'Scout',
    'Harvester',
    'Enforcer',
    'Catapult'
];

// these are the extra units that are purchasable w/ currency
bbq.units.configuration.unlockableUnits = [
    //'AxeThrower',
    'Brute',
    'Oracle',
    'WitchDoctor'
];

bbq.units.configuration.SpearWarrior = {
    foodCost: 30,
    health: 10,
    moveRange: 4,
    visionRange: 2,
    attackMinRange: 1,
    attackMaxRange: 1,
    attackDamage: 4,
    moveSpeed: 250,
    moveBonus: { dirt: 1 },
    displayName: "Spear Warrior",
    spinePath: 'assets/graphics/spine/spearwarrior/spearwarrior',
    description: 'The backbone of your tribe. Cheap and efficient.',
    commands: ['Attack', 'Move', 'Hold'],
    // healPoints : 1
    // revealRange : 1
    // revealRadius : 2
        
    // all units start at level 1						
    levelUp: {
        maxLevels: 3,

        // this lists everything, but you should only list what is needed
        level2: {
            requiredKills: 3,
            moveRange: 0,
            visionRange: 0,
            attackRange: 0,
            attackDamage: 1,
            health: 1 // increments current and max health
            // revealRange: 1
            // revealRadius : 2
            // healPoints: 1
        },
        level3: {
                requiredKills: 6,
                attackDamage: 1,
                health: 1
        }
    }
};

bbq.units.configuration.DartBlower = {
    foodCost: 35,
    health: 10,
    moveRange: 3,
    visionRange: 3,
    attackMinRange: 2,
    attackMaxRange: 4,
    attackDamage: 4,
    moveSpeed: 200,
    moveBonus: { dirt: 1 },
    displayName: "Axe Thrower", // TODO: change me!
    commands: ['Attack', 'Move', 'Hold'],
    spinePath: 'assets/graphics/spine/dartblower/dartblower',
    description: 'Can attack from a short distance. Be careful of enemies getting too close!',
    levelUp: {
        maxLevels: 3,
        level2: {
            requiredKills: 3,
            attackDamage: 1,
            moveRange: 1
        },
        level3: {
            requiredKills: 6,
            attackDamage: 1,
            attackMaxRange: 1
        }
    }
};

bbq.units.configuration.Enforcer = {
    foodCost: 60,
    health: 16,
    moveRange: 3,
    visionRange: 3,
    attackMinRange: 1,
    attackMaxRange: 1,
    attackDamage: 3,
    moveSpeed: 350,
    moveBonus: { dirt: 1 },
    displayName: "Enforcer",
    commands: ['Attack', 'Move', 'Hold'],
    spinePath: 'assets/graphics/spine/enforcer/enforcer',
    description: 'Slow but durable. Good for charging into the enemy base!',
    
    levelUp: {
        maxLevels: 3,
        level2: {
            requiredKills: 3,
            health: 2,
            attackDamage: 2,
            moveRange: 1
        },
        level3: {
            requiredKills: 5,
            health: 3,
            attackDamage: 1,
            moveRange: 1
        }
    }
};

bbq.units.configuration.Harvester = {
    foodCost: 25,
    health: 8,
    moveRange: 4,
    visionRange: 2,
    attackMinRange: 1,
    attackMaxRange: 1,
    attackDamage: 1,
    moveSpeed: 175,
    moveBonus: { dirt: 1 },
    displayName: "Harvester",
    commands: ['Attack', 'Move', 'Hold', 'Gather', 'Capture'],
    spinePath: 'assets/graphics/spine/harvester/harvester',
    description: 'The only unit that can capture buildings and harvest berries! She\'s peaceful and doesn\'t do well in battle.',
    
    levelUp: {
        maxLevels: 3,
        level2: {
            requiredKills: 2,
            health: 1,
            moveRange: 1,
			attackDamage: 1
        },
        level3: {
            requiredKills: 4,
            health: 2,
            moveRange: 2,
			attackDamage: 1
        }
    }
};

bbq.units.configuration.Scout = {
    foodCost: 50,
    health: 12,
    moveRange: 6,
    visionRange: 5,
    attackMinRange: 1,
    attackMaxRange: 1,
    attackDamage: 4,
    moveSpeed: 125,
    moveBonus: { dirt: 1 },
    displayName: "Scout",
    commands: ['Attack', 'Move', 'Hold'],
    spinePath: 'assets/graphics/spine/scout/scout',
    description: 'Need to see peek into enemy territory? Send him in! He does a good amount of damage too!',
    
    levelUp: {
        maxLevels: 3,
        level2: {
            requiredKills: 3,
            attackDamage: 1,
            moveRange: 1
        },
		
        level3: {
            requiredKills: 5,
            visionRange: 1,
            moveRange: 1
        }
    }
};

bbq.units.configuration.Catapult = {
    foodCost: 100,
    health: 6,
    moveRange: 2,
    visionRange: 2,
    attackMinRange: 3,
    attackMaxRange: 8,
    attackDamage: 7,
    moveSpeed: 400,
    moveBonus: { dirt: 2 },
    displayName: "Catapult",
    commands: ['Attack', 'Move', 'Hold'],
    spinePath: 'assets/graphics/spine/catapult/catapult',
    description: 'Expensive but packs a punch from a really long distance! However, this unit is too heavy to travel long distances.',
    
    levelUp: {
        maxLevels: 3,
        level2: {
            requiredKills: 3,
            attackDamage: 1
        },
        level3: {
            requiredKills: 6,
            attackRange: 1
        }
    }
};

bbq.units.configuration.AxeThrower = {
    foodCost: 40,
    health: 12,
    moveRange: 4,
    visionRange: 4,
    attackMinRange: 1,
    attackMaxRange: 3,
    attackDamage: 3,
    moveSpeed: 200,
    moveBonus: { dirt: 1 },
    displayName: "Axe Thrower",
    spinePath : 'assets/graphics/spine/axethrower/axethrower',
    commands: ['Attack', 'Move', 'Hold'],
    unlock: { price: 100, currency: 'BattleBadge' },
    description : 'The Axe Thrower can throw an axe from a distance with great and deadly force.',
    levelUp: {
        maxLevels: 3,
        level2: {
            requiredKills: 3,
            attackDamage: 1
        },
        level3: {
            requiredKills: 6,
            attackRange: 1
        }
    }
};

bbq.units.configuration.Brute = {
    foodCost: 100,
    health: 12,
    moveRange: 4,
    visionRange: 2,
    attackMinRange: 1,
    attackMaxRange: 1,
    attackDamage: 10,
    moveSpeed: 200,
    moveBonus: { dirt: 1 },
    displayName: "Brute",
    commands: ['Attack', 'Move', 'Hold'],
    spinePath: 'assets/graphics/spine/brute/brute',
    unlock: { price: 120, currency: 'BattleBadge' },
    description: 'A force to be reckoned with! Although he requires a lot of food, he is strong and durable enough to be worth it.',
    levelUp: {
        maxLevels: 3,
        level2: {
            requiredKills: 3,
            attackDamage: 1
        },
        level3: {
            requiredKills: 6,
            moveRange: 1,
			attackDamage: 2
        }
    }
};

bbq.units.configuration.Oracle = {
    foodCost: 40,
    health: 8,
    moveRange: 3,
    visionRange: 2,
    attackMinRange: 1,
    attackMaxRange: 2,
    attackDamage: 1,
    moveSpeed: 200,
    moveBonus: { dirt: 1 },
    revealRange: 8,
    revealRadius : 2,
    displayName: "Oracle",
    spinePath: 'assets/graphics/spine/oracle/oracle',
    commands: ['Attack', 'Move', 'Hold', 'Reveal'],
    unlock: { price: 150, currency: 'BattleBadge' },
    description: 'The Oracle can reveal a portion of the map from afar. Even units hidden in tall grass can be seen!',
    levelUp: {
        maxLevels: 3,
        level2: {
            requiredKills: 3,
            attackDamage: 1,
            revealRange: 1,
            revealRadius: 1
        },
        level3: {
            requiredKills: 6,
            attackRange: 1,
            revealRange: 1,
            revealRadius: 1
        }
    }
};

bbq.units.configuration.WitchDoctor = {
    foodCost: 40,
    health: 8,
    moveRange: 4,
    visionRange: 3,
    attackMinRange: 1,
    attackMaxRange: 1,
    attackDamage: 1,
    moveSpeed: 200,
    moveBonus: { dirt: 1 },
    healPoints : 3,
    displayName: "Witch Doctor",
    spinePath: 'assets/graphics/spine/witchdoctor/witchdoctor',
    description: 'When units are weak, the Witch Doctor can bring them back to health! Don\'t expect to do any damage with this unit though.',
    unlock : { price : 200, currency : 'BattleBadge' },
    commands: ['Attack', 'Move', 'Hold', 'Heal'],
    levelUp: {
        maxLevels: 3,
        level2: {
            requiredKills: 3,
            attackDamage: 1,
            healPoints: 1
        },
        level3: {
            requiredKills: 6,
            attackRange: 1,
            healPoints: 2
        }
    }
};