// Author Ryan Clark

function generateMaze(){
   var canvas = document.getElementById('maze');
   canvas.width  = 512.0;
   canvas.height = 512.0;

   var ctx = canvas.getContext("2d");
   ctx.fillStyle = "#FFFFFF";
   ctx.fillRect(0,0,512,512);

   let numRows = 32;
   let numCols = 32;

   curRow = [];
   sets = [];

   // Step 1: Initialize empty row
   for (var i = 0; i < numCols; i++){
       var set = new Set();
      sets.push(set);
      var cell = new Cell();
      curRow.push(cell);
   }
   // Loop until complete
   for (var i = 0; i < numRows; i++){
       // Step 2: join setless cells to sets
       for (var j = 0; j < curRow.length; j++){
           curRow[j].joinToUniqueSet(sets);
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
                   sets[curRow[j].id].merge(sets[curRow[j+1].id]);
               }
           }
       }
       // Step 4: Add bottom walls
       for (var j = 0; j < sets.length; j++){
           if(sets[j].cells.length == 0)
               continue;
            // choose one cell to remain open
            var index = Math.floor(Math.random() * sets[j].cells.length);
            sets[j].cells[index].bottomWall = false;
            // assign open / closed for all cells in set
            // leaving already open as open
            for (var k = 0; k < sets[j].cells.length; k++){
                if (sets[j].cells[k].bottomWall)
                    sets[j].cells[k].bottomWall = Math.random() >= 0.5;
            }
       }
       // Step 5: Generate next row
       if (i != numRows-1){
           render(canvas, ctx, numRows, numCols, i, curRow);
           for (var j = 0; j < curRow.length; j++){
               curRow[j].rightWall = false;
               if(curRow[j].bottomWall){
                   sets[curRow[j].id].remove(curRow[j]);
                   curRow[j].id = -1;
               }
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
                   sets[curRow[j].id].merge(sets[curRow[j+1].id]);
               }
           }
           render(canvas, ctx, numRows, numCols, i, curRow);
       }
   }
}

/**
 * Draw maze row by row
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
    joinToUniqueSet(sets){
        if(this.id >= 0)
            return;
        for(var i = 0; i < sets.length; i++){
            if(sets[i].cells.length == 0){
                this.id = i;
                sets[i].id = i;
                sets[i].add(this);
                break;
            }
        }
    }
}

/**
 * A set stores an array of cells and an ID.The class also implements
 * helper functions that add or remove elements, merge two sets, and
 * check if element is in the set
 */
class Set {
    constructor(){
        this.cells = [];
        this.id = 0;
    }
    add(cell){
        cell.id = this.id;
        this.cells.push(cell);
    }
    remove(cell){
        this.cells = this.cells.filter(function(item){ 
            return item !== cell
        })
    }
    merge(rightSet){
        for(var i = 0; i < rightSet.cells.length; i++){
            this.add(rightSet.cells[i]);
        }
        rightSet.cells.length = 0;
    }
}