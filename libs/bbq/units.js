/// <reference path="game.js" />

if (!window.bbq) { window.bbq = {}; }
if (!bbq.units) { bbq.units = {}; }

bbq.units.createUnit = function (unitState, team, em) {
    if (unitState.type == 'Gatherer') {
        unitState.type = 'Harvester';
    }
    var ent = new boc.core.Entity({ description: unitState.type, entityManager: em });

    ent.addComponent(new boc.components.Spatial({ x: 0, y: 0, z: bbq.zindex.UNITS, width: 0, height: 0 }));

    // DrawableSprite has precedence
    ent.addComponent(new boc.components.DrawableSprite({}));
    ent.addComponent(new boc.spine.SpineDrawable({ visible : true}));
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
    ent.DrawableSprite.image = boc.resources.GraphicsManager.getImage(ent.Unit.type + '_' + team.toLowerCase());
    ent.SpineDrawable.skeleton = boc.spine.SkeletonManager.createSkeleton(ent.Unit.type.toLowerCase() + '_' + team.toLowerCase(), { x: 50, y: -50 });
    ent.SpineDrawable.skeleton.setSkinByName('defaultSkin');
    ent.SpineDrawable.skeleton.setSlotsToSetupPose();

    var spineAnimation = new boc.spine.SpineAnimation({
        state: boc.constants.ANIMATION_STOPPED,
        target: ent.id()
    });
    spineAnimation.on('onComplete', function (animName) {
        ent.SpineDrawable.skeleton.setToSetupPose();
        ent.SpineDrawable.skeleton.updateWorldTransform();
    });
    ent.addComponent(spineAnimation);

    //ent.Spatial.update({ width: ent.DrawableSprite.image.width, height: ent.DrawableSprite.image.height });
    ent.Spatial.update({ width: 50, height: 50, scaleX: 0.5, scaleY: 0.5});
    
    var healthbarEnt = $em.create();
    $em(healthbarEnt) // the "inside" rect is w x h = 42 x 5
        .add(new boc.components.Spatial({ x: 2, y: ent.Spatial.height - 2, z: bbq.zindex.UNITS + 1, width: ent.Spatial.width - 4, height: 9 }))
        .add(new boc.components.DrawableRect({ fillStyle: 'rgb(64,64,64)', lineWidth: 2, strokeStyle: 'black' }));

    var healthbarComp = new bbq.components.HealthBar(healthbarEnt);
    ent.addComponent(healthbarComp);
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

    if (unitConfig.defaultImagePath) {
        ent.SpriteAnimationSet['default'] = boc.resources.GraphicsManager.getImage(unitConfig.defaultImagePath.replace('$(team)', team));
    }
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

    // further specialization
    if (unitConfig.healPoints) {
        ent.addComponent(new bbq.components.Heal(unitConfig.healPoints));
    }
    if (unitConfig.revealRange && unitConfig.revealRadius) {
        ent.addComponent(new bbq.components.Reveal(unitConfig.revealRange * 100, unitConfig.revealRadius * 100));
    }
    
    // healthbar setup        
    var healthbarSpatial = $em(healthbarEnt).comp('Spatial');
    healthbarComp.currentIcon = $em.create();
    $em(healthbarComp.currentIcon)
        .add(new boc.components.Spatial({ x: healthbarSpatial.x + 2, y: healthbarSpatial.y + 2, z: healthbarSpatial.z + 2, width: 0, height: 5 }))
        .add(new boc.components.DrawableRect({ fillStyle: 'lime', lineWidth: 0 }));
    boc.utils.follow(healthbarEnt, healthbarComp.currentIcon, em);
    $em(healthbarEnt).listen('onKill', function () {
        $em(healthbarComp.currentIcon).kill();
    });    
    var healthComp = ent.Health;// $em(e).comp('Health');
    var barWidth = 42; //px
    var healthPct = healthComp.current / healthComp.max;
    $em(healthbarComp.currentIcon).comp('Spatial').update({ width: Math.floor(barWidth * healthPct) });
    if (healthPct >= 0.65) {
        $em(healthbarComp.currentIcon).comp('DrawableRect').fillStyle = 'lime';
    }
    else if (healthPct >= 0.40) {
        $em(healthbarComp.currentIcon).comp('DrawableRect').fillStyle = 'gold';
    }
    else {
        $em(healthbarComp.currentIcon).comp('DrawableRect').fillStyle = 'firebrick';
    }

    if (healthComp.current >= healthComp.max) {
        $em(healthbarEnt).comp('DrawableRect').visible = false;
        $em(healthbarComp.currentIcon).comp('DrawableRect').visible = false;
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
            if (levelUp.healPoints) {
                var comp = $em(unitEnt).comp('Heal');
                if (comp) {
                    comp.points += levelUp.healPoitns;
                }
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