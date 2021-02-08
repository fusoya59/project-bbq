ns('bbq.algorithms');

// returns an array of tile keys [ "x,y" ]
bbq.algorithms.djikstra = function (p) {
    var sizeX = p.sizeX;
    var sizeY = p.sizeY;

    function getNeighbors(tile) {
        var result = new Array();
        var north = { x: tile.x, y: tile.y - 1 };
        var south = { x: tile.x, y: tile.y + 1 };
        var east = { x: tile.x + 1, y: tile.y };
        var west = { x: tile.x - 1, y: tile.y };
        var neighbors = [north, south, east, west];
        for (var i = 0; i < neighbors.length; i++) {
            var n = neighbors[i];
            if (n.x >= 0 && n.x < sizeX && n.y >= 0 && n.y < sizeY)
                result.push(n);
        }
        return result;
    }

    var em = p.entityManager;
    var entity = p.entity;
    var costMap = p.costMap;
    var rangeComponentName = p.rangeComponentName;
    var rangePropertyName = p.rangePropertyName;
    //var map = p.map;
    var costNodes = p.costNodes;
    var excludeList = p.excludeList;


    var entityRangeComponent = em.getComponentForEntity(rangeComponentName, entity);
    var maxRange = entityRangeComponent[rangePropertyName];
    if (p.rangeOffset) { maxRange += p.rangeOffset; }
    // TODO: apply bonuses

    var entityMapElement = em.getComponentForEntity('MapElement', entity);
    var startCell = p.startCell || { x: entityMapElement.x, y: entityMapElement.y };    
    
    var open = PriorityQueue({ low: true });
    open.contains = function (obj1, obj2) {
        return obj1.x == obj2.x && obj1.y == obj2.y;
    }
    var closed = [];
    var costList = [];

    open.push(
        startCell,
        costNodes[startCell.x][startCell.y].cost({
            em : em,
            entity: entity,
            rangeComponentName: rangeComponentName,
            currentCost: -1,
            maxRange : maxRange
        })
    );

    while (!open.empty()) {
        var curr = open.pop();
        closed.push(curr);
        if (maxRange == 0) break;

        var currCost = costMap[curr.x][curr.y];
        if (currCost < maxRange) {
            var neighbors = getNeighbors(curr);
            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                if (excludeList && excludeList.indexOf(boc.utils.toTileKey(neighbor)) >= 0) { continue; }
                var neighborCost = costMap[neighbor.x][neighbor.y];

                // vanilla cost					
                var tileCost = costNodes[neighbor.x][neighbor.y].cost({
                    em : em,
                    entity: entity,
                    rangeComponentName: rangeComponentName,
                    currentCost: currCost,
                    maxRange: maxRange
                }); //this.terrain[neighbor.x][neighbor.y][costName];
                
                if (currCost == -1) { currCost++; }
                var newCost = currCost + tileCost;

                if (neighborCost == -1 || newCost < neighborCost) {
                    costMap[neighbor.x][neighbor.y] = newCost;
                    if (!open.includes(neighbor, open.contains)) {
                        open.push(neighbor);
                        costList.push(neighbor);
                    }
                }
            } // i
        } // currcost					
    } // while

    var toReturn = [];

    //compile results
    for (var i = 0; i < closed.length; i++) {
        var r = closed[i];
        var rcost = costMap[r.x][r.y];
        var tileKey = r.x + ',' + r.y;
        if ((rcost <= maxRange || boc.utils.toTileKey(startCell) == tileKey) && toReturn.indexOf(tileKey) == -1) {            
            toReturn.push(tileKey);
        }
    } // i

    // clean up cost map
    for (var i = 0; i < costList.length; i++) {
        var r = costList[i];
        costMap[r.x][r.y] = -1;
    } // i

    return toReturn;
};

bbq.algorithms.AStarNode = function (tile) {
    this.g = 0;
    this.h = -1;
    this.f = function () {
        return this.g + this.h;
    }

    this.parent = null;
    this.tile = tile;

    this.getCost = function (otherNode) {
        return Math.abs(this.tile.x - otherNode.tile.x) * 100 + Math.abs(this.tile.y - otherNode.tile.y) * 100;
    }
}; //AStarNode

// returns an array of tile keys [ 'x,y' ]
bbq.algorithms.astar = function (p) {
    var sizeX = p.sizeX;
    var sizeY = p.sizeY;

    function getNeighbors(tile) {
        var result = new Array();
        var north = { x: tile.x, y: tile.y - 1 };
        var south = { x: tile.x, y: tile.y + 1 };
        var east = { x: tile.x + 1, y: tile.y };
        var west = { x: tile.x - 1, y: tile.y };
        var neighbors = [north, south, east, west];
        for (var i = 0; i < neighbors.length; i++) {
            var n = neighbors[i];
            if (n.x >= 0 && n.x < sizeX && n.y >= 0 && n.y < sizeY)
                result.push(n);
        }
        return result;
    } // getNeighbors

    function resetAStarMap(list) {
        for (var i = 0; i < list.length; i++) {
            var node = list[i];
            node.g = 0;
            node.h = -1;
            node.parent = null;
        }
    } //resetAStarMap

    var astarMap = p.astarMap;
    var costNodes = p.costNodes;
    var em = p.entityManager;
    var entity = p.entity;

    var rangeComponentName = p.rangeComponentName;
    var rangePropertyName = p.rangePropertyName;    
    
    var entityRangeComponent = em.getComponentForEntity(rangeComponentName, entity);
    var maxRange = entityRangeComponent[rangePropertyName];
    if (p.rangeOffset) { maxRange += p.rangeOffset; }

    var startTile = p.startTile;
    var endTile = p.endTile;
    var toReturn = [];

    var startNode = new bbq.algorithms.AStarNode(startTile);
    var endNode = new bbq.algorithms.AStarNode(endTile);
    var excludeList = p.excludeList;

    startNode.g = 0;
    startNode.h = startNode.getCost(endNode);
    startNode.parent = null;

    var open = PriorityQueue({ low: true });
    var closed = [];
    closed.indexOfNode = function (node) {
        for (var i = 0; i < this.length; i++) {
            if (this[i].tile.x == node.tile.x && this[i].tile.y == node.tile.y) {
                return i;
            }
        }//i
        return -1;
    }; //containsNode

    var astarList = [];

    open.push(startNode, startNode.f());

    var currCost = -1;
    while (!open.empty()) {
        var currNode = open.pop();

        // i found my way
        if (currNode.tile.x == endNode.tile.x &&
            currNode.tile.y == endNode.tile.y) {
            found = currNode;
            break;
        }

        closed.push(currNode);
        var neighborTiles = getNeighbors(currNode.tile);
        for (var i = 0; i < neighborTiles.length; i++) {
            var nTile = neighborTiles[i];
            if (excludeList && excludeList.indexOf(boc.utils.toTileKey(nTile)) >= 0) { continue; }
            var neighborNode = astarMap[nTile.x][nTile.y];

            var tileCost = costNodes[nTile.x][nTile.y].cost({
                em: em,
                entity: entity,
                rangeComponentName: rangeComponentName,
                currentCost: neighborNode.g,
                maxRange: maxRange
            });
            
            var cost = currNode.g + tileCost;

            if (open.includes(neighborNode) && cost < neighborNode.g)
                open.remove(neighborNode);

            //if (arrContains(closed, neighborNode) && cost < neighborNode.g)
            //arrRemove(closed, neighborNode);
            var nIndex = closed.indexOfNode(neighborNode);
            if (nIndex >= 0 && cost < neighborNode.g) {
                closed.splice(nIndex, 1);
            }

            if (!open.includes(neighborNode) && nIndex == -1) {
                neighborNode.g = cost;
                neighborNode.h = neighborNode.getCost(endNode);
                neighborNode.parent = currNode;
                open.push(neighborNode, neighborNode.f());
                astarList.push(neighborNode);
                currCost = cost;
            }
        } // for i						
    } // while

    if (found != null) {        
        // build path
        var stack = [];
        var curr = found;
        while (curr != null) {
            stack.push(curr);
            curr = curr.parent;
        }
        for (var i = stack.length - 1; i >= 0; i--) {
            toReturn.push(boc.utils.toTileKey(stack[i].tile));
        }        
    }

    resetAStarMap(astarList);
    return toReturn;
}; //astar

// assumes 0th element is the starting tile
bbq.algorithms.getCost = function (p) {
    var em = p.entityManager;
    var entity = p.entity;
    var costMap = p.costMap;
    var rangeComponentName = p.rangeComponentName;
    var rangePropertyName = p.rangePropertyName;
    var costNodes = p.costNodes;
    var path = p.path;

    var entityRangeComponent = em.getComponentForEntity(rangeComponentName, entity);
    var maxRange = entityRangeComponent[rangePropertyName];
    if (p.rangeOffset) { maxRange += p.rangeOffset; }

    var cost = 0;
    for (var i = 1; i < path.length; i++) {
        var tile = path[i].split(',');
        tile = { x: +tile[0], y: +tile[1] };
        cost += costNodes[tile.x][tile.y].cost({
            em: em,
            entity: entity,
            rangeComponentName: rangeComponentName,
            currentCost: cost,
            maxRange: maxRange
        });
    } // i

    return cost;
}; // getCost

ns('bbq.utils');

bbq.utils.getTilesWithinVisionRange = function (p) {
    return bbq.algorithms.djikstra({
        entityManager: p.entityManager,
        entity: p.entity,
        costMap: p.costMap,
        costNodes: p.costNodes,
        sizeX: p.sizeX,
        sizeY: p.sizeY,
        rangeComponentName: 'Vision',
        rangePropertyName: 'range',
        rangeOffset: p.rangeOffset
    });
};

bbq.utils.getVisionCost = function (p) {
    return bbq.algorithms.getCost({
        entityManager: p.entityManager,
        entity: p.entity,
        costMap: p.costMap,
        costNodes: p.costNodes,
        sizeX: p.sizeX,
        sizeY: p.sizeY,
        rangeComponentName: 'Vision',
        rangePropertyName: 'range'
    });
};

bbq.utils.getTilesWithinAttackRange = function (p) {
    var maxRange = bbq.algorithms.djikstra({
        entityManager: p.entityManager,
        entity: p.entity,
        costMap: p.costMap,
        costNodes: p.costNodes,
        sizeX: p.sizeX,
        sizeY: p.sizeY,
        rangeComponentName: 'Attack',
        rangePropertyName: 'maxRange',
        rangeOffset: p.rangeOffset
    });

    var minRange = bbq.algorithms.djikstra({
        entityManager: p.entityManager,
        entity: p.entity,
        costMap: p.costMap,
        costNodes: p.costNodes,
        sizeX: p.sizeX,
        sizeY: p.sizeY,
        rangeComponentName: 'Attack',
        rangePropertyName: 'minRange',
        rangeOffset : -100
    });

    for (var i = maxRange.length - 1; i >= 0; i--) {
        if (minRange.indexOf(maxRange[i]) >= 0) {
            maxRange.splice(i, 1);
        }
    }//i
    
    return maxRange;
}

bbq.utils.getTilesWithinMoveRange = function (p) {
    return bbq.algorithms.djikstra({
        entityManager: p.entityManager,
        entity: p.entity,
        costMap: p.costMap,
        costNodes: p.costNodes,
        sizeX: p.sizeX,
        sizeY: p.sizeY,
        rangeComponentName: 'Movement',
        rangePropertyName: 'range',
        rangeOffset: p.rangeOffset,
        startCell: p.startCell,
        excludeList : p.excludeList
    });
};

bbq.utils.getTilesWithinRevealRange = function (p) {
    return bbq.algorithms.djikstra({
        entityManager: p.entityManager,
        entity: p.entity,
        costMap: p.costMap,
        costNodes: p.costNodes,
        sizeX: p.sizeX,
        sizeY: p.sizeY,
        rangeComponentName: p.rangeComponentName || 'Reveal',
        rangePropertyName: p.rangePropertyName || 'range',
        rangeOffset: p.rangeOffset
    });
};

bbq.utils.getMoveCost = function (p) {
    return bbq.algorithms.getCost({
        entityManager: p.entityManager,
        entity: p.entity,
        costMap: p.costMap,
        costNodes: p.costNodes,
        rangeComponentName: 'Movement',
        rangePropertyName: 'range',
        path : p.path
    });
}; // getMoveCost

bbq.utils.findMovePath = function (p) {
    return bbq.algorithms.astar({
        entityManager: p.entityManager,
        entity: p.entity,
        astarMap: p.astarMap,
        costNodes: p.costNodes,
        sizeX: p.sizeX,
        sizeY: p.sizeY,
        rangeComponentName: 'Movement',
        rangePropertyName: 'range',
        rangeOffset: p.rangeOffset,
        startTile: p.startTile,
        endTile : p.endTile,
        excludeList : p.excludeList
    });
};//findMovementPath