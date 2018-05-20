// Author Ryan Clark

function generateMaze(){
   var canvas = document.getElementById('maze');
   canvas.width  = 256.0;
   canvas.height = 256.0;

   var ctx = canvas.getContext("2d");
   ctx.fillStyle = "#FFFFFF";
   ctx.fillRect(0,0,512,512);

   let numRows = 32;
   let numCols = 32;

   curRow = [];
   numberInSet = [];

   // Step 1: Initialize empty row
   for (var i = 0; i < numCols; i++){
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
           render(canvas, ctx, numRows, numCols, i, curRow);
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
           render(canvas, ctx, numRows, numCols, i, curRow);
       }
   }
}

/**
 * Draw maze row by row. This is BY FAR the slowest step. Raises asymptotic complexity
 * from O(n) to O(n^4) compared to unrendered maze
 */
function render(canvas, ctx, numRows, numCols, i, curRow){
    var width = canvas.width / numCols;
    var height = canvas.height / numRows;
    var x = width;
    var y = height * (i+1);
    ctx.strokeStyle = "#000";
    ctx.strokeWidth = 2;

    for (var j = 0; j < numCols; j++){
        if (curRow[j].bottomWall){
            ctx.moveTo(x,y);
            ctx.lineTo(x-width, y);
            ctx.stroke();
        }
        if (curRow[j].rightWall){
            ctx.moveTo(x,y);
            ctx.lineTo(x, y-height);
            ctx.stroke();
        }
        x += width;
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