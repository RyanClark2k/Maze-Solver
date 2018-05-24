// Author Ryan Clark

function generateAndSolve(){

    var canvas = document.getElementById('maze');
    var ctx = canvas.getContext("2d");

    let nRows = 32;
    let nCols = 32;
    // maze stored as a 1D array of integers with length nRows*nCols
    // 0 or 1 means no bottom wall, 0 or 2 means no right wall, three means both
    var maze = generateMaze(nRows, nCols);
    // choose random cell in first row as start and last row as end
    var start = Math.floor(Math.random() * nCols);
    var end = Math.floor(Math.random() * nCols + nCols * (nRows-1));
    var startX = start % nCols;
    var startY = Math.floor(start / nRows);
    var endX = end % nCols;
    var endY = Math.floor(end / nRows);

    // begin A* algorithm

    // List of nodes currently being explored. The node with the smallest fScore
    // will be evaluated and moved to the closed list
    var open = [];
    open.push(start);

    // Nodes already evaluated will show as true
    var closed = Array(nRows*nCols).fill(false);

    // Position of Cell from which the cell came. Start cell has position 1
    var cameFrom = Array(nRows*nCols).fill(-1);

    // gScore is number of steps to reach current node
    var gScore = Array(nRows*nCols).fill(Infinity);
    gScore[start] = 0;

    // fScore is heuristic combining gScore and Manhattan distance to finish
    var fScore = Array(nRows*nCols).fill(Infinity);
    fScore[start] = costEstimate(start, endX, endY, nRows, nCols);
    
    var path = null;

    while (open.length > 0){
        var bestFScore = Infinity;
        var current = 0;
        var currentIndex = 0;
        // select cell with lowest fScore to explore this iteration
        for(var i = 0; i < open.length; i++){
            if(fScore[open[i]] < bestFScore){
                bestFScore = fScore[open[i]];
                current = open[i];
                currentIndex = i;
            }
        }
        if (current == end){
            path = reconstructPath(cameFrom, current);
            break;
        }
        // remove current from open list and add to closed list
        open.splice(currentIndex, 1);
        closed[current] = true;

        // add neighbors to open list if no wall separates and calculate fScore
        for (var i = 0; i < 4; i++){
            var neighbor = current;
            if (i == 0){ // left
                if (current % nCols == 0)
                    continue;
                neighbor -= 1;
                if (hasRight(maze[neighbor]))
                    continue;
            }
            else if (i == 1){ // right
                if (current % nCols == nCols - 1)
                    continue;
                neighbor += 1;
                if (hasRight(maze[current]))
                    continue;
            }
            else if (i == 2){ // up
                if (Math.floor(current / nRows) == 0)
                    continue;
                neighbor -= nCols;
                if (hasBottom(maze[neighbor]))
                    continue;
            }
            else if (i == 3){ // down
                if (Math.floor(current / nRows) == nRows - 1)
                    continue;
                neighbor += nCols;
                if (hasBottom(maze[current]))
                    continue;
            }
            // if this cell evaluated already, simply continue
            if (closed[neighbor])
                continue;
            // if neighbor not already in open list, add to open list
            if (open.indexOf(neighbor) == -1)
                open.push(neighbor);
            var tentativeGScore = gScore[current] + 1;
            if (tentativeGScore >= gScore[neighbor])
                continue;
            
            // indicate that neighbor came from the current cell
            cameFrom[neighbor] = current;
            gScore[neighbor] = tentativeGScore;
            fScore[neighbor] = gScore[neighbor] + costEstimate(neighbor, endX, endY, nRows, nCols);
        }
    }

    if (path == null){
        console.log("Failure");
        return;
    }
    render(canvas, ctx, nRows, nCols, maze, path);
}

/**
 * Return a list of cell positions of cells visited by pathing algorithm
 */
function reconstructPath(cameFrom, current){
    totalPath = [];
    totalPath.push(current);
    while (current != -1){
        current = cameFrom[current];
        if (current != -1)
            totalPath.push(current);
    }
    return totalPath;
}

/**
 * Manhattan distance used as heuristic
 */
function costEstimate(position, endX, endY, nRows, nCols){
    pX = position % nCols;
    pY = Math.floor(position / nRows);
    return Math.abs(pX - endX) + Math.abs(pY - endY);
}

function hasBottom(n){
    return n >= 2;
}

function hasRight(n){
    return n % 2 == 1;
}

function generateMaze(nRows, nCols){
   var canvas = document.getElementById('maze');
   canvas.width  = 256.0;
   canvas.height = 256.0;

   var ctx = canvas.getContext("2d");
   ctx.fillStyle = "#FFFFFF";
   ctx.fillRect(0,0,canvas.width,canvas.height);

   let numRows = nRows;
   let numCols = nCols;

   curRow = [];
   numberInSet = [];

   var maze = [];
   maze.fill(0, 0, numRows * numCols);

   // Step 1: Initialize empty row
    for(var j = 0; j < numCols; j++){
        numberInSet.push(0);
        var cell = new Cell();
        curRow.push(cell);
   }
   // Loop until complete
   for (var i = 0; i < numRows; i++){
       // Step 2: join setless cells to sets
       for (var j = 0; j < curRow.length; j++){
           curRow[j].joinToUniqueSet(numberInSet);
       }
       // Step 3: Add right walls
       for (var j = 0; j < curRow.length; j++){
           if (j == curRow.length - 1){
               curRow[j].rightWall = true;
               break;
           }
           if (curRow[j+1].id == curRow[j].id){
               curRow[j].rightWall = true;
           }
           else {
               var addWall = Math.random() >= 0.5;
               curRow[j].rightWall = addWall;
               if (!addWall){
                   mergeSets(curRow[j].id, curRow[j+1].id, numberInSet, curRow);
               }
           }
       }
       // Step 4: Remove bottom walls
       for (var j = 0; j < curRow.length; j++){
           var removeWall = Math.random() >= 0.5;
           if (numberInSet[curRow[j].id] == 1)
               removeWall = true;
           curRow[j].bottomWall = !removeWall;
           if (!removeWall)
               numberInSet[curRow[j].id] -= 1;
       }
       // Step 5: Generate next row
       if (i != numRows-1){
        for(var j = 0; j < numCols; j++){
            maze[i*numCols + j] = (curRow[j].bottomWall ? 2 : 0) + (curRow[j].rightWall ? 1 : 0);
        }
           numberInSet.fill(0, 0, numberInSet.length-1);
           for (var j = 0; j < curRow.length; j++){
               curRow[j].rightWall = false;
               if(curRow[j].bottomWall)
                   curRow[j].id = -1;
               else
                   numberInSet[curRow[j].id] += 1;
               curRow[j].bottomWall = true;
           }
       }
       else {
           for (var j = 0; j < curRow.length; j++){
               curRow[j].bottomWall = true;
               if (j == curRow.length - 1){
                   curRow[j].rightWall = true;
                   break;
               }
               if (curRow[j+1].id != curRow[j].id){
                   curRow[j].rightWall = false;
                   mergeSets(curRow[j].id, curRow[j+1].id, numberInSet, curRow);
               }
           }
           for(var j = 0; j < numCols; j++){
               maze[i*numCols + j] = (curRow[j].bottomWall ? 2 : 0) + (curRow[j].rightWall ? 1 : 0);
           }
       }
   }
   return maze;
}

/**
 * Draw maze row by row. This is BY FAR the slowest step. Raises asymptotic complexity
 * from O(n) to O(n^4) compared to unrendered maze
 */
function render(canvas, ctx, numRows, numCols, maze, path){
    var width = canvas.width / numCols;
    var height = canvas.height / numRows;
    var x = width;
    var y = height;

    for (var i = 0; i < path.length; i++){
        ctx.fillStyle = (i == 0 || i == path.length - 1) ? "#0F0" : "#F00";
        var rectX = path[i] % numCols;
        var rectY = Math.floor(path[i] / numRows);
        ctx.fillRect(rectX * width, rectY * height, width, height);
    }

    ctx.strokeStyle = "#000";
    ctx.strokeWidth = 2;

    for (var i = 0; i < numRows; i++){
        for (var j = 0; j < numCols; j++){
            n = maze[numCols*i+j];
            if (hasBottom(n)){
                ctx.moveTo(x,y);
                ctx.lineTo(x-width, y);
                ctx.stroke();
            }
            if (hasRight(n)){
                ctx.moveTo(x,y);
                ctx.lineTo(x, y-height);
                ctx.stroke();
            }
            x += width;
        }
        x = width;
        y += height;
    }
}

/**
 * Move all cells in set of right cell to set of left cell
 */
function mergeSets(leftSetID, rightSetID, numberInSet, cells) {
    for (var i = 0; i < cells.length; i++){
        if (cells[i].id == rightSetID){
            cells[i].id = leftSetID;
            numberInSet[rightSetID]--;
            numberInSet[leftSetID]++;
        }
        if (numberInSet[rightSetID] == 0)
            break;
    }
}

/**
 * Cell simply stores booleans for whether bottom and top walls are enabled,
 * and the id of the set the cell is currently part of. JoinToUniqueSet adds
 * the cell to the first available set in the array sets.
 */
class Cell {
    constructor(){
        this.bottomWall = true;
        this.rightWall = false;
        this.id = -1;
    }
    joinToUniqueSet(numberInSet){
        if(this.id >= 0)
            return;
        for(var i = 0; i < numberInSet.length; i++){
            if(numberInSet[i] == 0){
                this.id = i;
                numberInSet[i]++;
                break;
            }
        }
    }
}