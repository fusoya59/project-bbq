ns('bbq.tilesets.forest');

//bbq.tilesets.forest.imagePath = "assets/Tiles/forestTiles.png";
bbq.tilesets.forest.imagePath = "assets/graphics/forestTiles.png";
bbq.tilesets.forest.grass = {
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
};

bbq.tilesets.forest.dirt = {
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
};

bbq.tilesets.forest.water = {
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
};

bbq.tilesets.forest.props = {
    offsets: {
        rock: { x: 0, y: 450, width: 50, height: 50 },
        highgrass: { x: 50, y: 450, width: 50, height: 50 },
        tree: { x: 100, y: 450, width: 50, height: 50 },
        berries: { x: 150, y: 450, width: 50, height: 50 }
    },
    properties: {
        rock: {
            moveCost: function (p) { return 99999; }
        },
        highgrass: {
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
        tree: {
            visionBonus: 1 // tile
        },
        berries: {
            foodPerTurn: 10
        }
    }
};

bbq.tilesets.forest.edges = {
    offsets: {
        nw: { x: 750, y: 250, width: 100, height: 100 },
        n: { x: 850, y: 250, width: 50, height: 100 },
        ne: { x: 900, y: 250, width: 100, height: 100 },

        w: { x: 750, y: 350, width: 100, height: 50 },
        e: { x: 900, y: 350, width: 100, height: 50 },

        sw: { x: 750, y: 400, width: 100, height: 100 },
        s: { x: 850, y: 400, width: 50, height: 100 },
        se: { x: 900, y: 400, width: 100, height: 100 }
    }
};