if (!window.bbq) { window.bbq = {}; }
if (!bbq.buildings) { bbq.buildings = {}; }

bbq.buildings.configuration = {
    Hut: {
        vision: 0,
        turnsTilCap: 2,
        foodProduced: 1,
        defaultImagePath: 'assets/Buildings/hut_$(team).png',
        commands : [ 'Train' ]
    },

    Farm: {
        vision: 0,
        turnsTilCap: 2,
        foodProduced: 2,
        defaultImagePath: 'assets/Buildings/farm_$(team).png'
    },

    HQ: {
        vision: 0,
        turnsTilCap: 4,
        foodProduced: 3,
        defaultImagePath: 'assets/Buildings/hq_$(team).png'
    }
};

bbq.buildings.createBuilding = function (buildingState, team, em) {
    team = team.replace('_', '').toLowerCase();
    var ent = new boc.core.Entity({ description: buildingState.type, entityManager: em });

    ent.addComponent(new boc.components.Spatial({ x: 0, y: 0, z: bbq.zindex.BUILDINGS, width: 0, height: 0 }));
    ent.addComponent(new boc.components.DrawableSprite({}));
    ent.addComponent(new boc.components.Identifiable({}));
    ent.addComponent(new bbq.components.Building({ type: buildingState.type }));
    if (ent.Building.type == 'HQ') {
        ent.addComponent(new bbq.components.MapElement({ x: -1, y: -1 }));
        ent.MapElement.offset = { x: 0, y: -15 };
    }
    ent.addComponent(new bbq.components.FoodProducer({}));
    ent.addComponent(new bbq.components.Buffable({}));
    ent.addComponent(new bbq.components.Debuffable({}));    
    ent.addComponent(new bbq.components.Vision({}));
    ent.addComponent(new bbq.components.Commandable({}));

    bbq.buildings.specialize(ent, buildingState, team, em);
    return ent.id();
};

bbq.buildings.specialize = function (ent, buildingState, team, em) {
    var buildingConfig = bbq.buildings.configuration[ent.Building.type]; //
    //console.log(buildingConfig.defaultImagePath.replace('$(team)', team));
    ent.DrawableSprite.image = boc.resources.GraphicsManager.getImage(buildingConfig.defaultImagePath.replace('$(team)', team));
    ent.Spatial.update({ width: ent.DrawableSprite.image.width, height: ent.DrawableSprite.image.height });
    ent.Building.turnsUntilCapture = buildingState.turnsUntilCapture ? buildingState.turnsUntilCapture : buildingConfig.turnsTilCap;
    ent.FoodProducer.food = buildingConfig.foodProduced;
    ent.Vision.range = buildingConfig.vision;

    // TODO: buffs    
    if (buildingConfig.commands) {
        for (var i = 0; i < buildingConfig.commands.length; i++) {
            ent.Commandable.commands.push(new bbq.commands[buildingConfig.commands[i]](em));
        } // i
    }
};