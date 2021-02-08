if (!window.bbq) { window.bbq = {}; }
if (!bbq.tileset) { bbq.tilesets = {}; }

bbq.tilesets.forest = {    
    imagePath : "assets/Tiles/forestTiles.png",
    grass : {
        offsets : {
            base0 : { x: 0, y: 0, width : 50, height : 50 },
            base1 : { x: 800, y: 0, width : 50, height : 50 },
            base2 : { x: 850, y: 0, width : 50, height : 50 },
            nw :    { x: 0, y: 50, width : 50, height : 50 },
            n :     { x: 100, y: 0, width : 50, height : 50 },
            ne :    { x: 50, y: 50, width : 50, height : 50 },
            w :     { x: 50, y: 0, width : 50, height : 50 },
            e :     { x: 200, y: 0, width : 50, height : 50 },
            sw :    { x: 350, y: 50, width : 50, height : 50 },
            s :     { x: 400, y: 0, width : 50, height : 50 },
            se :    { x: 150, y: 50, width : 50, height : 50 }
        },
        properties : {
            moveCost : function(p) { return 100; },
            visionCost : function(p) { return 100; },
            attackCost: function (p) { return 100; },
            zIndex : 3
        }    
    },
    dirt : {
        offsets : {
            base :  { x: 0, y: 150, width : 50, height : 50 },
            nw :    { x: 0, y: 200, width : 50, height : 50 },
            n :     { x: 100, y: 150, width : 50, height : 50 },
            ne :    { x: 50, y: 200, width : 50, height : 50 },
            w :     { x: 50, y: 150, width : 50, height : 50 },
            e :     { x: 200, y: 150, width : 50, height : 50 },
            sw :    { x: 350, y: 200, width : 50, height : 50 },
            s :     { x: 400, y: 150, width : 50, height : 50 },
            se :    { x: 150, y: 200, width : 50, height : 50 }
        },
        properties : {
            moveCost: function (p) {
                var movement = $em(p.entity).comp('Movement');
                if (movement && movement.bonus) {
                    return movement.bonus('dirt');
                }
                return 100;
            },
            visionCost : function(p) { return 100; },
            attackCost: function (p) { return 100; },
            zIndex: 2
        }
    },
    water : {
        offsets : {
            base0 :  { x: 0, y: 300, width : 50, height : 50 },
            base1 :  { x: 50, y: 300, width : 50, height : 50 },
            base2 :  { x: 100, y: 300, width : 50, height : 50 },            
            base3 :  { x: 150, y: 300, width : 50, height : 50 },
            base4 :  { x: 200, y: 300, width : 50, height : 50 },
            base5 :  { x: 250, y: 300, width : 50, height : 50 },
            base6 :  { x: 300, y: 300, width : 50, height : 50 },
            base7 :  { x: 350, y: 300, width : 50, height : 50 },
            base8 :  { x: 400, y: 300, width : 50, height : 50 },            
            base9 :  { x: 450, y: 300, width : 50, height : 50 }            
        },
        properties : {
            moveCost: function (p) {
                var cost = 100;

                if (p.em.getComponentForEntity(p.rangeComponentName, p.entity)) { // this should always execute, i think. maybe.
                    var tc = p.maxRange - (p.currentCost); // this says the cost of this tile will consume the rest of the 'available movement'
                    //if (p.currentCost == -1) { /*tc--;*/ tc -= 100; }
                    if (/*tc > 1*/ tc > 100) {
                        cost = tc;
                    }
                }
                return cost;                
            },
            visionCost : function(p) { return 100; },
            attackCost: function (p) { return 100; },
            zIndex: 1
        }
    },
    props : {
        offsets : {
            rock :      { x: 0, y: 450, width : 50, height : 50 },
            highgrass : { x: 50, y: 450, width : 50, height : 50 },
            tree :      { x: 100, y: 450, width : 50, height : 50 },            
            berries :   { x: 150, y: 450, width : 50, height : 50 }
        },
        properties : {
            rock : {
                moveCost: function (p) { return 99999; }
            },
            highgrass : {
                visionCost: function (p) {
                    var comp = p.em.getComponentForEntity(p.rangeComponentName, p.entity);
                    if (comp) {
                        var bonus = 0;
                        //TODO: do up bonuses
                        //if (entity.Vision.getTileBonus)
                            //bonus = entity.Vision.getTileBonus(); // take account for any tile bonuses too
                        //bonus += BuffUtils._getBonusForEntity('bonusVision', entity);
                        return comp.range + bonus - 1;
                    }
                    return 0;                    
                }
            },
            tree : {
                visionBonus : 1 // tile
            },
            berries : {
                foodPerTurn : 1
            }
        }
    },    
    createTile : function(p) {        
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
    }, //createTile
    createProp : function(p) {
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
    }, // createProp

    createFringe: function (p) {
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
        return ent;
    } //createFringe
}; // forest