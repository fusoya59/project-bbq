ns('bbq');
ns('boc.utils');

boc.utils.getNeighboringTiles = function (tile, sizeX, sizeY) {
    var result = new Array();
    var north = { x: tile.x, y: tile.y - 1, heading : 'n'};
    var south = { x: tile.x, y: tile.y + 1, heading: 's' };
    var east = { x: tile.x + 1, y: tile.y, heading: 'e' };
    var west = { x: tile.x - 1, y: tile.y, heading: 'w' };
    var ne = { x: tile.x + 1, y: tile.y - 1, heading: 'ne' };
    var nw = { x: tile.x - 1, y: tile.y - 1, heading: 'nw' };
    var se = { x: tile.x + 1, y: tile.y + 1, heading: 'se' };
    var sw = { x: tile.x - 1, y: tile.y + 1, heading: 'sw' };

    var neighbors = [north, south, east, west, ne, nw, se, sw];
    for (var i = 0; i < neighbors.length; i++) {
        var n = neighbors[i];
        if (n.x >= 0 && n.x < sizeX && n.y >= 0 && n.y < sizeY)
            result.push(n);
    }
    return result;
};

// { tileWidth, tileHeight }
bbq.Map = function (id, entityManager, options) {    
    var mapData = bbq.maps[id];
    if (!mapData) { throw 'could not find map ' + id + '!'; }
    if (!options) { options = {}; }

    var _tileWidth = options.tileWidth || 50;
    var _tileHeight = options.tileHeight || 50;
    var _numColumns = mapData.width;
    var _numRows = mapData.height;
    var _terrainString = mapData.terrain;
    var _propString = mapData.props;
    var _tileset = mapData.tileset.toLowerCase();    
    var _padding = {
        left: options['padding-left'],
        right: options['padding-right'],
        top: options['padding-top'],
        bottom: options['padding-bottom']
    };

    var em = entityManager;
    
    var _mapArray = new Array(_numColumns);
    var _astarMap = new Array(_numColumns);
    var _costMap = new Array(_numColumns);
    
    // these will have cost node components
    var _visionMap = new Array(_numColumns);
    var _movementMap = new Array(_numColumns);
    var _attackMap = new Array(_numColumns);
    
    // setup map arrays
    for (var i = 0; i < _numColumns; i++) {
        _mapArray[i] = new Array(_numRows);
        _costMap[i] = new Array(_numRows);
        _astarMap[i] = new Array(_numRows);
        _visionMap[i] = new Array(_numColumns);
        _movementMap[i] = new Array(_numColumns);
        _attackMap[i] = new Array(_numColumns);
        for (var j = 0; j < _numRows; j++) {
            _mapArray[i][j] = [];
            _costMap[i][j] = -1;
            _astarMap[i][j] = new bbq.algorithms.AStarNode({ x: i, y: j });            
        }
    } // i       


    this.astarMap = function () { return _astarMap; };
    this.costMap = function () { return _costMap; };
    this.visionMap = function () { return _visionMap; }
    this.movementMap = function () { return _movementMap; }
    this.attackMap = function () { return _attackMap; }

    this.id = function () { return id; }
    this.tileWidth = function () { return _tileWidth; }
    this.tileHeight = function () { return _tileHeight; }
    this.numColumns = function () { return _numColumns; }
    this.numRows = function () { return _numRows; }
    this.width = function () { return _tileWidth * _numColumns; }
    this.height = function () { return _tileHeight * _numRows; }
    this.bounds = function() { return boc.utils.toBounds(bgEnt.Spatial); }
    this.padding = function () { return _padding; }
    this.avgTurnsToWin = function() {
    	return mapData.averageTurnsToWin;
    };

    this.startState = mapData.startstate;

    this.getTile = function(entityOrId) {
        var entity = entityOrId;
        if (typeof(entity) != 'string') { entity = entity.id(); }
        var spatial = em.getComponentForEntity('Spatial', entity);
        if (spatial) {
            return {
                x: Math.floor((spatial.x + spatial.width / 2) / _tileWidth),
                y: Math.floor((spatial.y + spatial.height / 2) / _tileHeight)
            };        
        }
        return null;
    }; //getTileFromSpatial
    
    this.place = function (entityOrId, x, y) {
        var entity = entityOrId;
        if (typeof(entity) != 'string') { entity = entity.id(); }
        var spatial = em.getComponentForEntity('Spatial', entity);
        var mapElement = em.getComponentForEntity('MapElement', entity);
        var newMapElement = !mapElement;
        if (newMapElement) {
            mapElement = new bbq.components.MapElement(
                {
                    x: x,
                    y: y
                }
            );            
            em.addComponentToEntity(mapElement, entity);
        }
        
        // something's changed!
        if (mapElement.x != x || mapElement.y != y || newMapElement) {
            if (_mapArray[mapElement.x] && _mapArray[mapElement.x][mapElement.y]) {
                var entityIndex = _mapArray[mapElement.x][mapElement.y].indexOf(entity);
                if (entityIndex >= 0) {
                    _mapArray[mapElement.x][mapElement.y].splice(entityIndex, 1);
                }
            }
            _mapArray[x][y].push(entity);            
            
            spatial.update({
                x: Math.floor(x * _tileWidth) + (mapElement.offset ? mapElement.offset.x : 0),
                y: Math.floor(y * _tileHeight) + (mapElement.offset ? mapElement.offset.y : 0)
            });            

            mapElement.x = x;
            mapElement.y = y;

            // also update Zs for units and buildings            
            if ($em(entity).has('Unit') || $em(entity).has('Building')) {
                $em(entity).comp('Spatial').update({ z: bbq.zindex.UNITSANDBUILDINGS + mapElement.y * 10 + _mapArray[x][y].length });
            }            
        }

        if (!mapElement.onKill) {
            mapElement.onKill = function () {
                var mindex = -1;
                if (_mapArray[mapElement.x] && _mapArray[mapElement.x][mapElement.y]) {
                    mindex = _mapArray[mapElement.x][mapElement.y].indexOf(entityOrId);
                }
                if (mindex >= 0) {
                    _mapArray[mapElement.x][mapElement.y].splice(mindex, 1);
                }
            } // onKill
            em.addListenerForEntity(entityOrId, 'onKill', mapElement.onKill);
        }
    }; //placeEntityOnTile
    
    this.getEntities = function(x, y, withComponent) {
        var retArr = [];
        if (_mapArray[x] && _mapArray[x][y]) {
            retArr = _mapArray[x][y].slice();
            if (withComponent) {
                for (var i = retArr.length - 1; i >= 0; i--) {
                    var ent = retArr[i];
                    if (!em.getComponentForEntity(withComponent, ent)) {
                        retArr.splice(i, 1);
                    }
                } // i               
            }
            return retArr;
        }
        else {
            return null;
        }        
    }; //getEntities

    function sortZ(a, b) {
        var spatialA = em.getComponentForEntity('Spatial', a);
        var spatialB = em.getComponentForEntity('Spatial', b);

        if (!spatialA && !spatialB) { return 0; }
        if (spatialA && !spatialB) { return 1; }
        if (!spatialA && spatialB) { return -1; }
        return spatialB.z - spatialA.z;
    } // sortZ

    // updates the cost maps
    this.refresh = function (excludedEntities) {
        if (!excludedEntities) { excludedEntities = []; }

        // greater z order wins
        for (var i = 0; i < _numColumns; i++) {
            for (var j = 0; j < _numRows; j++) {
                var visionCostNodes = this.getEntities(i, j, 'VisionCostNode').sort(sortZ);
                
                for (var k = 0; k < visionCostNodes.length; k++) {
                    if (excludedEntities.indexOf(visionCostNodes[k]) >= 0) {
                        continue;
                    }
                    _visionMap[i][j] = em.getComponentForEntity('VisionCostNode', visionCostNodes[k]);
                    break;
                }//k

                var moveCostNodes = this.getEntities(i, j, 'MoveCostNode').sort(sortZ);
                for (var k = 0; k < moveCostNodes.length; k++) {
                    if (excludedEntities.indexOf(moveCostNodes[k]) >= 0) {                        
                        continue;
                    }
                    _movementMap[i][j] = em.getComponentForEntity('MoveCostNode', moveCostNodes[k]);
                    break;
                }//k

                var attackCostNodes = this.getEntities(i, j, 'AttackCostNode').sort(sortZ);
                for (var k = 0; k < attackCostNodes.length; k++) {
                    if (excludedEntities.indexOf(attackCostNodes[k]) >= 0) {
                        continue;
                    }
                    _attackMap[i][j] = em.getComponentForEntity('AttackCostNode', attackCostNodes[k]);
                    break;
                }//k
            } //j
        } //i
    }; // refresh

    // draw the map
    Math.seedrandom(0);
    var terrainLines = _terrainString.split('|');
    var propLines = _propString.split('|');
    var waterTileCount = 0;

    for (var i = 0; i < terrainLines.length; i++) {
        var terrainLine = terrainLines[i];
        var propLine = propLines[i]; // should be the same

        for (var j = 0; j < terrainLine.length; j++) {
            var terrainChar = terrainLine.charAt(j);
            var propChar = propLine.charAt(j);

            var terrainEntity = bbq.tilesets[_tileset].createTile({
                id: 'tile(' + j + ',' + i + ')',
                type: terrainChar,
                x: j,
                y: i,
                z: bbq.zindex.TERRAIN,
                width: _tileWidth,
                height: _tileHeight,
                entityManager: em
            });
            if (terrainEntity) {                
                this.place(terrainEntity, j, i);
                //var visionCostNode = em.getComponentForEntity('VisionCostNode', terrainEntity);
                //if (visionCostNode) { _visionMap[j][i] = visionCostNode; }
                //var moveCostNode = em.getComponentForEntity('MoveCostNode', terrainEntity);
                //if (moveCostNode) { _movementMap[j][i] = moveCostNode; }
                //var attackCostNode = em.getComponentForEntity('AttackCostNode', terrainEntity);
                //if (attackCostNode) { _attackMap[j][i] = attackCostNode; }
            }

            var propEntity = bbq.tilesets[_tileset].createProp({
                id: 'prop(' + j + ',' + i + ')',
                type: propChar,
                x: j,
                y: i,
                z: bbq.zindex.PROPS,
                width: _tileWidth,
                height: _tileHeight,
                entityManager: em
            });

            if (terrainChar == 'w') {
                waterTileCount++;
            }

            if (propEntity) {
                //_mapArray[j][i].push(propEntity);
                this.place(propEntity, j, i);
                //var visionCostNode = em.getComponentForEntity('VisionCostNode', propEntity);
                //if (visionCostNode) { _visionMap[j][i] = visionCostNode; }
                //var moveCostNode = em.getComponentForEntity('MoveCostNode', propEntity);
                //if (moveCostNode) { _movementMap[j][i] = moveCostNode; }
                //var attackCostNode = em.getComponentForEntity('AttackCostNode', propEntity);
                //if (attackCostNode) { _attackMap[j][i] = attackCostNode; }
            }
        } //j
    } //i

    // 2nd pass: smoothing
    var seenTiles = [];
    for (var i = 0; i < _numColumns; i++) {
        for (var j = 0; j < _numRows; j++) {
            var terrEnt = this.getEntities(i, j, 'Terrain')[0];
            var terrain = em.getComponentForEntity('Terrain', terrEnt);            
            var neighbors = boc.utils.getNeighboringTiles({ x: i, y: j }, _numColumns, _numRows);
            for (var k = 0; k < neighbors.length; k++) {
                var neighbor = neighbors[k]; // x, y, heading
                var neighborEnt = this.getEntities(neighbor.x, neighbor.y, 'Terrain')[0];                
                var neighborTerr = em.getComponentForEntity('Terrain', neighborEnt);
                if (neighborTerr.type == terrain.type) { continue; }
                bbq.tilesets[_tileset].createFringe({
                    id: 'fringe(' + i + ',' + j + ')',
                    type: terrain.type,
                    x: neighbor.x,
                    y: neighbor.y,
                    z: bbq.zindex.TERRAIN,
                    width: _tileWidth,
                    height : _tileHeight,
                    heading: neighbor.heading,
                    entityManager: em
                });
            }
        } //j
    } // i

    //background
    var bgEnt = new boc.core.Entity({ entityManager: em });
    bgEnt.addComponent(new boc.components.Spatial({
        x: -_padding.left,
        y: -_padding.top,
        z: bbq.zindex.TERRAIN - 1,
        width: _tileWidth * _numColumns + 2 * _padding.left,
        height: _tileHeight * _numRows + 2 * _padding.top
    }));
    bgEnt.addComponent(new boc.components.DrawableRect({
        fillStyle: options.bgColor || 'black',
        lineWidth: 0
    }));    

    var zOrderedEntities = $em('Terrain').all().concat($em('Prop').all()).concat($em('Fringe').all());

    // This number determines whether to render it on another canvas or to keep it
    var WATER_TILES_THRESHOLD = 75; // need a sweet spot for this thing
    var needWaterBaked = waterTileCount > WATER_TILES_THRESHOLD;
    console.log('waterTileCount', waterTileCount);

    // should be cached
    var terrainId = this.id() + '_terrain';
    var waterId = this.id() + '_water0'; // assume if 0's there, the rest are too
    
    var waterSprites, terrainImg;

    if (!boc.resources.GraphicsManager.getImage(terrainId)) {

        // new drawing routine!
        var terrainCanvas = $('<canvas>')[0];
        terrainCanvas.height = this.height();
        terrainCanvas.width = this.width();
        var terrainContext = terrainCanvas.getContext('2d');

        var waterContexts = [];
        var waterCanvases = [];
        if (needWaterBaked) {
            for (var w in bbq.tilesets.forest.water.offsets) {
                var waterCanvas = $('<canvas>')[0];
                waterCanvas.height = this.height();
                waterCanvas.width = this.width();
                waterCanvases.push(waterCanvas);
                var waterContext = waterCanvas.getContext('2d');
                waterContexts.push(waterContext);
                //$(document.body).append(waterCanvas);
            }
        }

        zOrderedEntities.sort(function (a, b) {
            var spatialA = $em(a).comp('Spatial');
            var spatialB = $em(b).comp('Spatial');
            return (spatialA.z - spatialB.z);
        });
        
        for (var i = 0; i < zOrderedEntities.length; i++) {
            var terrainComponent = $em(zOrderedEntities[i]).comp('Terrain'),
                drawableComponent = $em(zOrderedEntities[i]).comp('DrawableSprite'),
                spatialComponent = $em(zOrderedEntities[i]).comp('Spatial');

            var contextArr;

            if (terrainComponent && terrainComponent.type == 'water') {
                contextArr = waterContexts;
            }
            else {
                contextArr = [terrainContext];
            }

            for (var j = 0; j < contextArr.length; j++) {
                var context = contextArr[j];
                context.save();
                context.globalAlpha = drawableComponent.alpha;

                // i can make some safe assumptions. the context array length == water animation length
                var sanim = $em(zOrderedEntities[i]).comp('SpriteAnimation');
                if (sanim) {
                    drawableComponent = sanim.sprites[j];
                }

                if (!drawableComponent.clipRect) {
                    try {
                        context.drawImage(drawableComponent.image,
                            spatialComponent.x,
                            spatialComponent.y,
                            spatialComponent.width,
                            spatialComponent.height
                        );
                    } catch (err) {
                        console.log(zOrderedEntities[i], ' image bad');
                    }
                }
                else {
                    context.drawImage(drawableComponent.image,
                        drawableComponent.clipRect.x,
                        drawableComponent.clipRect.y,
                        drawableComponent.clipRect.width,
                        drawableComponent.clipRect.height,
                        spatialComponent.x,
                        spatialComponent.y,
                        spatialComponent.width,
                        spatialComponent.height
                    );
                }
                context.restore();
            }
        } // for i

        // now add the smoothing

        terrainImg = new Image();
        terrainImg.width = this.width();
        terrainImg.height = this.height();
        console.log('terrain', terrainImg.width, terrainImg.height);
        terrainImg.src = terrainCanvas.toDataURL();
        boc.resources.GraphicsManager.addImage(this.id() + '_terrain', terrainImg);

        waterSprites = [];
        for (var i = 0; i < waterContexts.length; i++) {
            var waterImg = new Image();
            waterImg.width = this.width();
            waterImg.height = this.height();
            waterImg.src = waterCanvases[i].toDataURL();
            var sprite = new boc.components.DrawableSprite({ image: waterImg });
            sprite.tag = 'water' + i;
            waterSprites.push(sprite);
            boc.resources.GraphicsManager.addImage(this.id() + '_water' + i, waterImg);
        }
    } else {
        terrainImg = boc.resources.GraphicsManager.getImage(this.id() + '_terrain');
        waterSprites = [];
        var k = 0;
        for (var w in bbq.tilesets.forest.water.offsets) {
            waterSprites.push(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(this.id() + '_water' + k++) }));
        }
    }
    
    if (needWaterBaked) {
        var waterEnt = $em.create(this.id() + '_water');
        $em(waterEnt)
            .add(new boc.components.Spatial({ x: 0, y: 0, z: bbq.zindex.TERRAIN, width: this.width(), height: this.height() }))
            .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(this.id() + '_water0'), visible: true }));

        var anim = new boc.utils.SpriteAnimationSequence({
            entity: waterEnt,
            entityManager: $em(),
            loop: true,
            animations: [
                new boc.components.SpriteAnimation({
                    duration: 2000,
                    easing: 'linear',
                    sprites: waterSprites
                }) // Spriteanimation
            ] // animations
        }); // SpriteaniamtionSequence
        anim.start();
    }

    var terrainEnt = $em.create(this.id() + '_terrain');
    $em(terrainEnt)
        .add(new boc.components.Spatial({ x: 0, y: 0, z: bbq.zindex.TERRAIN + 1, width: this.width(), height: this.height() }))
        .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(this.id() + '_terrain'), visible: true }));

    for (var i = 0; i < zOrderedEntities.length; i++) {        
        var drawableSprite = $em(zOrderedEntities[i]).comp('DrawableSprite');
        var spriteAnimation = $em(zOrderedEntities[i]).comp('SpriteAnimation');
        var terrain = $em(zOrderedEntities[i]).comp('Terrain');
        if (!needWaterBaked && terrain && terrain.type == 'water') {
            continue;
        }
        if (drawableSprite) {
            $em(zOrderedEntities[i]).remove(drawableSprite.className());
        }
        if (spriteAnimation) {
            $em(zOrderedEntities[i]).remove(spriteAnimation.className());
        }
    }

    // draw the edges
    var edgeOffsets = bbq.tilesets.forest.edges.offsets;
    // corners
    var corner = $em.create(this.id() + '_corner_nw');
    $em(corner)
        .add(new boc.components.Spatial({ x: -edgeOffsets.nw.width, y: -edgeOffsets.nw.height, z: bbq.zindex.TERRAIN + 1, width: edgeOffsets.nw.width, height: edgeOffsets.nw.height }))
        .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath), visible: true, clipRect: edgeOffsets.nw }));

    corner = $em.create(this.id() + '_corner_ne');
    $em(corner)
        .add(new boc.components.Spatial({ x: this.width(), y: -edgeOffsets.ne.height, z: bbq.zindex.TERRAIN + 1, width: edgeOffsets.ne.width, height: edgeOffsets.ne.height }))
        .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath), visible: true, clipRect: edgeOffsets.ne }));

    corner = $em.create(this.id() + '_corner_sw');
    $em(corner)
        .add(new boc.components.Spatial({ x: -edgeOffsets.sw.width, y: this.height(), z: bbq.zindex.TERRAIN + 1, width: edgeOffsets.sw.width, height: edgeOffsets.sw.height }))
        .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath), visible: true, clipRect: edgeOffsets.sw }));

    corner = $em.create(this.id() + '_corner_se');
    $em(corner)
        .add(new boc.components.Spatial({ x: this.width(), y: this.height(), z: bbq.zindex.TERRAIN + 1, width: edgeOffsets.se.width, height: edgeOffsets.se.height }))
        .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath), visible: true, clipRect: edgeOffsets.se }));

    // top row    
    for (var x = 0; x < _numColumns; x++) {
        var side = $em.create(this.id() + '_top');
        $em(side)
            .add(new boc.components.Spatial({ x: x * _tileWidth, y: -edgeOffsets.n.height, z: bbq.zindex.TERRAIN + 1, width: edgeOffsets.n.width, height: edgeOffsets.n.height }))
            .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath), visible: true, clipRect: edgeOffsets.n }));
    }

    // bottom row    
    for (var x = 0; x < _numColumns; x++) {
        var side = $em.create(this.id() + '_bottom');
        $em(side)
            .add(new boc.components.Spatial({ x: x * _tileWidth, y: this.height(), z: bbq.zindex.TERRAIN + 1, width: edgeOffsets.s.width, height: edgeOffsets.s.height }))
            .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath), visible: true, clipRect: edgeOffsets.s }));
    }

    // left
    for (var y = 0; y < _numRows; y++) {
        var side = $em.create(this.id() + '_left');
        $em(side)
            .add(new boc.components.Spatial({ x: -edgeOffsets.w.width, y: y * _tileHeight, z: bbq.zindex.TERRAIN + 1, width: edgeOffsets.w.width, height: edgeOffsets.w.height }))
            .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath), visible: true, clipRect: edgeOffsets.w }));
    }

    // right
    for (var y = 0; y < _numRows; y++) {
        var side = $em.create(this.id() + '_right');
        $em(side)
            .add(new boc.components.Spatial({ x: this.width(), y: y * _tileHeight, z: bbq.zindex.TERRAIN + 1, width: edgeOffsets.e.width, height: edgeOffsets.e.height }))
            .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath), visible: true, clipRect: edgeOffsets.e }));
    }
    //for (var y = 1; y < _numRows - 1; y++) {
    //    var side = $em.create(this.id() + '_side');
    //    $em(side)
    //        .add(new boc.components.Spatial({ x: this.width(), y: this.height(), z: bbq.zindex.TERRAIN + 1, width: edgeOffsets.se.width, height: edgeOffsets.se.height }))
    //        .add(new boc.components.DrawableSprite({ image: boc.resources.GraphicsManager.getImage(bbq.tilesets.forest.imagePath), visible: true, clipRect: edgeOffsets.se }));
    //}


    this.refresh();
};