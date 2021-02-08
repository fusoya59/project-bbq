/// <reference path="game.js" />

if (!window.bbq) { window.bbq = {}; }
if (!bbq.units) { bbq.units = {}; }

bbq.units.configuration = {

    SpearWarrior: {
        foodCost: 3,
        health: 7,
        moveRange: 4,
        visionRange: 2,
        attackMinRange: 1,
        attackMaxRange: 1,
        attackDamage: 5,
        moveSpeed: 250,
        moveBonus: { dirt: 1 },
        displayName: "Spear Warrior",
        defaultImagePath: 'assets/Units/SpearWarrior/$(team)/Idle/SpearWarrior_Idle0001.png',
        animationSets : {
            'idle': {
                frameCount: 9, // starts from 1
                duration : 1000,
                imagePath: 'assets/Units/SpearWarrior/$(team)/Idle/SpearWarrior_Idle$(frame).png'
            },
            'walk': {
                frameCount: 9,
                duration: 500,
                imagePath: 'assets/Units/SpearWarrior/$(team)/Walk/SpearWarrior_Walk$(frame).png'
            },
            'attack': {
                frameCount: 28,
                duration: 1000,
                imagePath: 'assets/Units/SpearWarrior/$(team)/Attack/SpearWarrior_Attack$(frame).png',
                hitTime : 500
            }
        },
        commands: ['Attack', 'Move', 'Hold'],

        
        // all units start at level 1						
        levelUp: {
            maxLevels: 3,

            // this lists everything, but you should only list what is needed
            level2: {
                requiredKills: 3,
                moveRange: 0,
                visionRange: 0,
                attackRange: 0,
                attackDamage: 2,
                health: 1 // increments current and max health
            },
            level3: {
                requiredKills: 6,
                attackDamage: 2,
                health: 1
            }
        }
    },

    DartBlower: {
        foodCost: 4,
        health: 5,
        moveRange: 3,
        visionRange: 2,
        attackMinRange: 2,
        attackMaxRange: 4,
        attackDamage: 4,
        moveSpeed: 200,
        moveBonus: { dirt: 1 },
        displayName: "Dart Blower",
        defaultImagePath: 'assets/Units/DartBlower/$(team)/Idle/DartBlower_Idle0001.png',
        commands: ['Attack', 'Move', 'Hold'],
        animationSets: {
            'idle': {
                frameCount: 9, // starts from 1
                duration: 1000,
                imagePath: 'assets/Units/DartBlower/$(team)/Idle/DartBlower_Idle0001.png'
            },
            'walk': {
                frameCount: 9,
                duration: 500,
                imagePath: 'assets/Units/DartBlower/$(team)/Idle/DartBlower_Idle0001.png'
            },
            'attack': {
                frameCount: 28,
                duration: 1000,
                imagePath: 'assets/Units/DartBlower/$(team)/Idle/DartBlower_Idle0001.png',
                hitTime: 500
            }
        },
        
        levelUp: {
            maxLevels: 3,
            level2: {
                requiredKills: 3,
                attackDamage: 2,
                moveRange: 2
            },
            level3: {
                requiredKills: 6,
                attackDamage: 2,
                moveRange: 1
            }
        }
    },
    Enforcer: {
        foodCost: 6,
        health: 24,
        moveRange: 3,
        visionRange: 2,
        attackMinRange: 1,
        attackMaxRange: 1,
        attackDamage: 4,
        moveSpeed: 350,
        moveBonus: { dirt: 1 },
        displayName: "Enforcer",
        defaultImagePath: 'assets/Units/Enforcer/$(team)/Idle/Enforcer_Idle0001.png',
        commands: ['Attack', 'Move', 'Hold'],
        animationSets: {
            'idle': {
                frameCount: 9, // starts from 1
                duration: 1000,
                imagePath: 'assets/Units/Enforcer/$(team)/Idle/Enforcer_Idle0001.png'
            },
            'walk': {
                frameCount: 9,
                duration: 500,
                imagePath: 'assets/Units/Enforcer/$(team)/Idle/Enforcer_Idle0001.png'
            },
            'attack': {
                frameCount: 28,
                duration: 1000,
                imagePath: 'assets/Units/Enforcer/$(team)/Idle/Enforcer_Idle0001.png',
                hitTime: 500
            }
        },
        
        levelUp: {
            maxLevels: 3,
            level2: {
                requiredKills: 3,
                health: 2,
                attackDamage: 2,
                moveRange: 1
            },
            level3: {
                requiredKills: 6,
                health: 3,
                attackDamage: 1,
                moveRange: 1
            }
        }
    },

    Gatherer: {
        foodCost: 2,
        health: 5,
        moveRange: 5,
        visionRange: 2,
        attackMinRange: 1,
        attackMaxRange: 1,
        attackDamage: 1,
        moveSpeed: 175,
        moveBonus: { dirt: 1 },
        displayName: "Gatherer",
        defaultImagePath: 'assets/Units/Gatherer/$(team)/Idle/Gatherer_Idle0001.png',
        commands: ['Attack', 'Move', 'Hold', 'Gather', 'Capture'],
        animationSets: {
            'idle': {
                frameCount: 9, // starts from 1
                duration: 1000,
                imagePath: 'assets/Units/Gatherer/$(team)/Idle/Gatherer_Idle0001.png'
            },
            'walk': {
                frameCount: 9,
                duration: 500,
                imagePath: 'assets/Units/Gatherer/$(team)/Idle/Gatherer_Idle0001.png'
            },
            'attack': {
                frameCount: 28,
                duration: 1000,
                imagePath: 'assets/Units/Gatherer/$(team)/Idle/Gatherer_Idle0001.png',
                hitTime: 500
            }
        },

        levelUp: {
            maxLevels: 3,
            level2: {
                requiredKills: 3,
                health: 1,
                moveRange: 1
            },
            level3: {
                requiredKills: 6,
                health: 2,
                moveRange: 2
            }
        }
    },

    Scout: {
        foodCost: 5,
        health: 6,
        moveRange: 6,
        visionRange: 5,
        attackMinRange: 1,
        attackMaxRange: 1,
        attackDamage: 3,
        moveSpeed: 125,
        moveBonus: { dirt: 1 },
        displayName: "Scout",
        defaultImagePath: 'assets/Units/Scout/$(team)/Idle/Scout_Idle0001.png',
        commands: ['Attack', 'Move', 'Hold'],
        animationSets : {
            'idle': {
                frameCount: 9, // starts from 1
                duration : 1000,
                imagePath: 'assets/Units/Scout/$(team)/Idle/Scout_Idle0001.png'
            },
            'walk': {
                frameCount: 9,
                duration: 500,
                imagePath: 'assets/Units/Scout/$(team)/Idle/Scout_Idle0001.png'
            },
            'attack': {
                frameCount: 28,
                duration: 1000,
                imagePath: 'assets/Units/Scout/$(team)/Idle/Scout_Idle0001.png',
                hitTime : 500
            }
        },

        levelUp: {
            maxLevels: 3,
            level2: {
                requiredKills: 3,
                attackDamage: 2,
                moveRange: 2
            },
            level3: {
                requiredKills: 6,
                attackDamage: 2,
                moveRange: 1
            }
        }
    },

    Catapult: {
        foodCost: 10,
        health: 5,
        moveRange: 2,
        visionRange: 1,
        attackMinRange: 3,
        attackMaxRange: 8,
        attackDamage: 6,
        moveSpeed: 400,
        moveBonus: { dirt: 1 },
        displayName: "Catapult",
        defaultImagePath :  'assets/Units/Catapult/$(team)/Idle/Right/Catapult_IdleRight_0001.png',
        commands: ['Attack', 'Move', 'Hold'],
        animationSets: {
            'idle': {
                frameCount: 1, // starts from 1
                duration: 1000,
                imagePath: 'assets/Units/Catapult/$(team)/Idle/Right/Catapult_IdleRight_$(frame).png'
            },
            'walk': {
                frameCount: 1,
                duration: 500,
                imagePath: 'assets/Units/Catapult/$(team)/Idle/Right/Catapult_IdleRight_$(frame).png'
            },
            'attack': {
                frameCount: 150,
                duration: 5000,
                imagePath: 'assets/Units/Catapult/Blue/Attack/Right/Catapult_AttackRight_$(frame).png'
            }
        },
        animationSetsDefault: {
            'idle': {
                frameCount: 9, // starts from 1
                duration: 1000,
                imagePath: 'assets/Units/Catapult/$(team)/Idle/Right/Catapult_IdleRight_0001.png'
            },
            'walk': {
                frameCount: 9,
                duration: 500,
                imagePath: 'assets/Units/Catapult/$(team)/Idle/Right/Catapult_IdleRight_0001.png'
            },
            'attack': {
                frameCount: 150,
                duration: 5000,
                imagePath: 'assets/Units/Catapult/$(team)/Idle/Right/Catapult_IdleRight_0001.png'                
            }
        },
        
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
    }
}; // configuration

bbq.units.createUnit = function (unitState, team, em) {
    var ent = new boc.core.Entity({ description: unitState.type, entityManager: em });

    ent.addComponent(new boc.components.Spatial({ x: 0, y: 0, z: bbq.zindex.UNITS, width: 0, height: 0 }));
    ent.addComponent(new boc.components.DrawableSprite({}));
    ent.addComponent(new boc.components.Identifiable({}));
    ent.addComponent(new boc.components.SpriteAnimationSet());

    ent.addComponent(new bbq.components.Unit({ type: unitState.type }));
    ent.addComponent(new bbq.components.Buffable({}));
    ent.addComponent(new bbq.components.Debuffable({}));
    ent.addComponent(new bbq.components.Trainable({}));
    ent.addComponent(new bbq.components.Attack({}));
    ent.addComponent(new bbq.components.Retaliate({}));
    ent.addComponent(new bbq.components.Vision({}));
    ent.addComponent(new bbq.components.Movement({}));
    ent.addComponent(new bbq.components.Health({}));
    ent.addComponent(new bbq.components.Commandable({}));
    ent.addComponent(new bbq.components.MoveCostNode(function () { return 99999; }));       

    bbq.units.specialize(ent, unitState, team, em);
    return ent.id();
};

bbq.units.specialize = function (ent, unitState, team, em) {
    var unitConfig = bbq.units.configuration[ent.Unit.type]; //
    ent.Unit.state = unitState.state ? unitState.state : 'idle';
    ent.Unit.kills = unitState.options && unitState.options.kills ? unitState.options.kills : 0;
    ent.DrawableSprite.image = boc.resources.GraphicsManager.getImage(unitConfig.defaultImagePath.replace('$(team)', team));    
    ent.Spatial.update({ width: ent.DrawableSprite.image.width, height: ent.DrawableSprite.image.height });
    
    var healthbarEnt = $em.create();
    $em(healthbarEnt) // the "inside" rect is w x h = 42 x 5
        .add(new boc.components.Spatial({ x: 2, y: ent.Spatial.height - 2, z: bbq.zindex.UNITS + 1, width: ent.Spatial.width - 4, height: 9 }))
        .add(new boc.components.DrawableRect({ fillStyle: 'rgb(64,64,64)', lineWidth: 2, strokeStyle: 'black' }));
    ent.addComponent(new bbq.components.HealthBar(healthbarEnt));
    boc.utils.follow(ent.id(), healthbarEnt, em);
    $em(ent.id()).listen('onKill', function () {
        $em(healthbarEnt).kill();
    });

    // TODO: buffs

    ent.Trainable.foodCost = unitConfig.foodCost;
    ent.Attack.minRange = unitConfig.attackMinRange * 100; // multiplied to avoid pesky rounding issues
    ent.Attack.maxRange = unitConfig.attackMaxRange * 100;
    ent.Attack.damage = unitConfig.attackDamage;
    ent.Retaliate.minRange = unitConfig.attackMinRange * 100;
    ent.Retaliate.maxRange = unitConfig.attackMaxRange * 100;
    ent.Retaliate.damage = Math.floor(unitConfig.attackDamage / 2);
    ent.Vision.range = unitConfig.visionRange * 100;
    ent.Movement.range = unitConfig.moveRange * 100;
    ent.Movement.velocity = unitConfig.moveSpeed;
    //var bonusMultiplier = UnitConfig.dartBlower.moveRange / (UnitConfig.dartBlower.moveRange + UnitConfig.dartBlower.moveBonus[tileType]);
    ent.Movement.bonus = function (tileType) {
        if (tileType === 'dirt') {            
            return Math.floor(ent.Movement.range / (ent.Movement.range + unitConfig.moveBonus[tileType] * 100) * 100);
        }
        return 100;
    };
    ent.Health.current = unitState.hp ? unitState.hp : unitConfig.health;
    ent.Health.max = unitConfig.health;

    for (var i = 0; i < unitConfig.commands.length; i++) {
        ent.Commandable.commands.push(new bbq.commands[unitConfig.commands[i]](em));
    }

    ent.SpriteAnimationSet['default'] = boc.resources.GraphicsManager.getImage(unitConfig.defaultImagePath.replace('$(team)', team));
    if (unitConfig.animationSets) {
        
        for (var n in unitConfig.animationSets) {
            var animSet = unitConfig.animationSets[n];
            if (ent.Unit.type === 'Catapult' && team === 'blue') {
                animSet = unitConfig.animationSetsDefault[n];
            }
            var animSprites = [];
            for (var i = 1; i <= animSet.frameCount; i++) {
                var imagePath = animSet.imagePath.replace('$(team)', team).replace('$(frame)', boc.utils.leftPad(i, 4));
                animSprites.push(
                    new boc.components.DrawableSprite({
                        image: boc.resources.GraphicsManager.getImage(imagePath)
                    })
                );
            } //i
            ent.SpriteAnimationSet[n] =
                new boc.components.SpriteAnimation({
                    sprites: animSprites,
                    duration: animSet.duration,
                    easing: 'linearTween',
                    state : boc.constants.ANIMATION_STOPPED
                });
        } //n
        
    }
};

bbq.units.getLevel = function (unitEnt) {
    var unit = $em(unitEnt).comp('Unit');
    var unitConfig = bbq.units.configuration[unit.type];
    if (unitConfig && unitConfig.levelUp) {
        var currLevel = 1;
        for (var i = 2; i <= unitConfig.levelUp.maxLevels; i++) {
            var neededKills = unitConfig.levelUp["level" + i].requiredKills;
            if (unit.kills >= neededKills)
                currLevel++;
        } // i
        return currLevel;
    }
    else {
        return 1;
    }    
}

bbq.units.levelUp = function (unitEnt, newLevel, dontAddHealth) {
    var unit = $em(unitEnt).comp('Unit');
    var unitConfig = bbq.units.configuration[unit.type];
    if (unitConfig && unitConfig.levelUp) {
        for (var i = unit.level + 1; i <= newLevel; i++) {
            var levelUp = unitConfig.levelUp["level" + i];

            if (levelUp.moveRange) {
                $em(unitEnt).comp('Movement').range += levelUp.moveRange * 100;
            }
            if (levelUp.visionRange) {
                $em(unitEnt).comp('Vision').range += levelUp.visionRange * 100;
            }
            if (levelUp.attackRange) {
                $em(unitEnt).comp('Attack').maxRange += levelUp.attackRange * 100;
            }
            if (levelUp.attackDamage) {
                $em(unitEnt).comp('Attack').damage += levelUp.attackDamage;
            }
            if (levelUp.health) {
                if (!dontAddHealth) {
                    $em(unitEnt).comp('Health').current += levelUp.health;
                }
                $em(unitEnt).comp('Health').max += levelUp.health;
            }
        } // for i
        unit.level = newLevel;
        //EffectFactory.createScrollingText(ent.Spatial.left, ent.Spatial.top + ent.Spatial.height / 2, "Level Up!");
        var spatial = $em(unitEnt).comp('Spatial');        
        
        if (!dontAddHealth) {
            var drawableText = new boc.components.DrawableText({ text: 'Level up!', fillStyle : 'white' });
            boc.utils.createScrollingDrawable(drawableText, spatial.x, spatial.y + spatial.height / 2, { easing: 'easeOutQuad', duration: 1300 });
        }
    }
} 