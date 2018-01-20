
   var playerInput = new Object();
   
   function doKeyDown(event){
       console.log('hi')
      var keynum;
   
      if(window.event){ 
         keynum = event.keyCode;
      }
      else{
         keynum = event.which;
      }
   
      if(keynum == 37){
         playerInput.left = 1;
      }
      else if(keynum == 38){
         playerInput.up = 1;
      }
      else if(keynum == 39){
         playerInput.right = 1;
      }
      else if(keynum == 40){
         playerInput.down = 1;
      }
   }
   
   function doKeyUp(event){
      var keynum;
      
      if(window.event){ 
         keynum = event.keyCode;
      }
      else{
         keynum = event.which;
      }
   
      if(keynum == 37){
         playerInput.left = 0;
      }
      else if(keynum == 38){
         playerInput.up = 0;
      }
      else if(keynum == 39){
         playerInput.right = 0;
      }
      else if(keynum == 40){
         playerInput.down = 0;
      }
   }
  
   function runMaze()
   {
     var mazeCanvas = document.getElementById("mazeCanvas");
     var scene = new THREE.Scene();
     var renderer = new THREE.WebGLRenderer({ canvas: mazeCanvas });
     var camera = new THREE.PerspectiveCamera( 75, mazeCanvas.width/mazeCanvas.height, 0.1, 1000 );

var wallGeometry = new THREE.PlaneGeometry( 1, 0.5 );
var wallMaterial = new THREE.MeshStandardMaterial( {color: 0x2194ce});
function placeWall(x,y,direction){
    var wall = new THREE.Mesh( wallGeometry, wallMaterial );
    wall.position.z = y;
    wall.position.x = x;
 
    if(direction == 'n'){
       wall.position.z -= 0.5;
    }
    else if(direction == 'e'){
       wall.position.x += 0.5;
       wall.rotation.y = -Math.PI/2;
    }
    else if(direction == 's'){
       wall.position.z += 0.5;
       wall.rotation.y = Math.PI;
    }
    else if(direction == 'w'){
       wall.position.x -= 0.5;
       wall.rotation.y = Math.PI/2;
    }
    else{
       return false;
    }
 
    scene.add(wall);
 }

 function MazeCell(northWall, eastWall, southWall, westWall){
    this.northWall = northWall;
    this.eastWall = eastWall;
    this.southWall = southWall;
    this.westWall = westWall;
 }

 var mazeGrid = [Array(2), Array(2)];
 mazeGrid[0][0] = new MazeCell(true, false, false, true);
 mazeGrid[0][1] = new MazeCell(true, true, true, false);
 mazeGrid[1][0] = new MazeCell(false, true, true, true);
 mazeGrid[1][1] = new MazeCell(false,false,false,false);

 mazeGrid.forEach(function(mazeRow, rowCount){
    mazeRow.forEach(function(mazeCell, colCount){
       if(mazeCell.northWall)
          placeWall(colCount, rowCount, 'n');
       if(mazeCell.eastWall)
          placeWall(colCount, rowCount, 'e');
       if(mazeCell.southWall)
          placeWall(colCount, rowCount, 's');
       if(mazeCell.westWall)
          placeWall(colCount, rowCount, 'w');
    });
 });

 


var playerPointLight = new THREE.PointLight();
playerPointLight.position.set( 0, 0, 0)
scene.add( playerPointLight );
var render = function () {
    requestAnimationFrame( render );
    
       if(playerInput.left){
          camera.rotation.y += 0.01;
       }
       else if(playerInput.right){
          camera.rotation.y -= 0.01;
       }
    
       renderer.render(scene, camera);
};

render();
   }