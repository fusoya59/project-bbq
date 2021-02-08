// tileset utility functions

var bbq = bbq || {};
bbq.tilesets = bbq.tilesets || {};
bbq.tilesets.forest = bbq.tilesets.forest  || {};

bbq.tilesets.forest.createTile = function(p) {        
    var em = p.entityManager;        
        
    var clipRect = null;
    var terrainType = null;
    var z = 0;
    switch(p.type) {
        case 'g': 
            var rng = Math._random();
            if (rng < 0.05) {
                clipRect = bbq.tilesets.forest.grass.offsets.base1;
            }
            else if (rng >= 0.05 && rng < 0.15) {
                clipRect = bbq.tilesets.forest.grass.offsets.base2;
            }
            else {
                clipRect = bbq.tilesets.forest.grass.offsets.base0;
            }              
            terrainType = 'grass';
            z = bbq.tilesets.forest.grass.properties.zIndex;
            break;
            
        case 'd':
            clipRect = bbq.tilesets.forest.dirt.offsets.base;
            z = bbq.tilesets.forest.dirt.properties.zIndex;
            terrainType = 'dirt';
            break;                
        case 'w':                
            clipRect = bbq.tilesets.forest.water.offsets.base0;
            z = bbq.tilesets.forest.water.properties.zIndex;
            terrainType = 'water';
            break;
        default:
            return null;
    }
    var ent = em.createEntity(p.id);
    em.addComponentToEntity(
        new boc.components.Spatial({
            x: p.x * p.width,
            y: p.y * p.height,
            z: p.z + z,
            width: p.width,
            height: p.height
        }),
        ent
    );

        
    em.addComponentToEntity(
        new boc.components.DrawableSprite({
            image : boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath),
            clipRect : clipRect
        }),
        ent
    );
        
    if (p.type == 'w') {
        var sprites = [];
        for (var w in bbq.tilesets.forest.water.offsets) {
            sprites.push(
                new boc.components.DrawableSprite({
                    image : boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath),
                    clipRect : bbq.tilesets.forest.water.offsets[w]
                })
            );
        } // each water tile
            
        var anim = new boc.utils.SpriteAnimationSequence({
            entity : ent,
            entityManager : em,
            loop : true,
            animations : [
                new boc.components.SpriteAnimation({                        
                    duration : 2000,
                    easing : 'linear',
                    sprites : sprites
                }) // Spriteanimation
            ] // animations
        }); // SpriteaniamtionSequence
        anim.start();
    } // if water
        
    em.addComponentToEntity(
        new bbq.components.Terrain({
            type : terrainType
        }),
        ent
    );
    em.addComponentToEntity(new boc.components.Identifiable({}), ent);
    em.addComponentToEntity(new bbq.components.MoveCostNode(bbq.tilesets.forest[terrainType].properties.moveCost), ent);
    em.addComponentToEntity(new bbq.components.VisionCostNode(bbq.tilesets.forest[terrainType].properties.visionCost), ent);
    em.addComponentToEntity(new bbq.components.AttackCostNode(bbq.tilesets.forest[terrainType].properties.attackCost), ent);
    return ent;
}; //createTile

bbq.tilesets.forest.createProp = function(p) {
    var em = p.entityManager;        
        
    var clipRect = null;
    var propType = null;
    var visionCostFn = null,
        moveCostFn = null,
        attackCostFn = null;
    var gatherComp = null;
    switch(p.type) {
        case 'R':
            clipRect = bbq.tilesets.forest.props.offsets.rock;
            moveCostFn = bbq.tilesets.forest.props.properties.rock.moveCost;
            propType = 'rock';
            break;
        case 'H':
            clipRect = bbq.tilesets.forest.props.offsets.highgrass;
            visionCostFn = bbq.tilesets.forest.props.properties.highgrass.visionCost;
            propType = 'highgrass';
            break;
        case 'T':
            clipRect = bbq.tilesets.forest.props.offsets.tree;
            propType = 'tree';
            break;
        case 'B':
            clipRect = bbq.tilesets.forest.props.offsets.berries;
            propType = 'berries';
            gatherComp = new bbq.components.Gatherable(bbq.tilesets.forest.props.properties.berries.foodPerTurn);
            break;
        default:
            return null;
    }
    var ent = em.createEntity(p.id);
    em.addComponentToEntity(
        new boc.components.Spatial({
            x: p.x * p.width,
            y: p.y * p.height,
            z: p.z,
            width: p.width,
            height: p.height
        }),
        ent
    );
    em.addComponentToEntity(
        new boc.components.DrawableSprite({
            image : boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath),
            clipRect : clipRect
        }),
        ent
    );
    em.addComponentToEntity(
        new bbq.components.Prop({
            type : propType
        }),
        ent            
    );
    if (gatherComp) { em.addComponentToEntity(gatherComp, ent); }

    em.addComponentToEntity(new boc.components.Identifiable({}), ent);
    if (moveCostFn) {
        em.addComponentToEntity(new bbq.components.MoveCostNode(moveCostFn), ent);
    }
    if (visionCostFn) {
        em.addComponentToEntity(new bbq.components.VisionCostNode(visionCostFn), ent);
    }        
    if (attackCostFn) {
        em.addComponentToEntity(new bbq.components.AttackCostNode(attackCostFn), ent);
    }
    return ent;
}; // createProp

bbq.tilesets.forest.createFringe = function (p) {
    var em = p.entityManager;
        
    // heading to fringe image
    var fringe = null;
    switch (p.heading) {
        case 'n':
            fringe = 's';
            break;
        case 's':
            fringe = 'n';
            break;
        case 'e':
            fringe = 'w';
            break;
        case 'w':
            fringe = 'e';
            break;
        case 'ne':
            fringe = 'sw';
            break;
        case 'nw':
            fringe = 'se';
            break;
        case 'se':
            fringe = 'nw';
            break;
        case 'sw':
            fringe = 'ne';
            break;
    }
    if (!fringe) { return null; }

    var clipRect = null;
    var z = 0;
    switch (p.type) {
        case 'grass':
            clipRect = bbq.tilesets.forest.grass.offsets[fringe];
            z = bbq.tilesets.forest.grass.properties.zIndex;                
            break;
        case 'dirt':
            clipRect = bbq.tilesets.forest.dirt.offsets[fringe];
            z = bbq.tilesets.forest.dirt.properties.zIndex;                
            break;            
        default:
            return null;
    }
    var ent = em.createEntity(p.id);
    em.addComponentToEntity(
        new boc.components.Spatial({
            x: p.x * p.width,
            y: p.y * p.height,
            z: p.z + z,
            width: p.width,
            height: p.height
        }),
        ent
    );
    em.addComponentToEntity(
        new boc.components.DrawableSprite({
            image: boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath),
            clipRect: clipRect
        }),
        ent
    );
    em.addComponentToEntity(new bbq.components.Fringe(), ent);
    return ent;
}; //createFringe