if (!window.bbq) { window.bbq = {}; }
if (!boc.utils) { boc.utils = {}; }

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
    this.padding = function() { return _padding; }

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

    this.refresh();
};