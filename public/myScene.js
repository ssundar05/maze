

var playerInput = new Object();

//on key down check the keypressed and set the direction on playerInput
function doKeyDown(event) {
    var keynum;

    if (window.event) {
        keynum = event.keyCode;
    }
    else {
        keynum = event.which;
    }
    if (keynum == 37) {
        playerInput.left = 1;
    }
    else if (keynum == 38) {
        playerInput.up = 1;
    }
    else if (keynum == 39) {
        playerInput.right = 1;
    }
    else if (keynum == 40) {
        playerInput.down = 1;
    }
}

//reset playerInput object
function doKeyUp(event) {
    var keynum;

    if (window.event) {
        keynum = event.keyCode;
    }
    else {
        keynum = event.which;
    }

    if (keynum == 37) {
        playerInput.left = 0;
    }
    else if (keynum == 38) {
        playerInput.up = 0;
    }
    else if (keynum == 39) {
        playerInput.right = 0;
    }
    else if (keynum == 40) {
        playerInput.down = 0;
    }
}

function Maze() {

    var scene = new THREE.Scene();
    
    // Create a basic perspective camera
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    camera.position.z = 4;
    
    // Create a renderer 
    var renderer = new THREE.WebGLRenderer({canvas: mazeCanvas });
    
    // Configure renderer clear color
    renderer.setClearColor("#000000");
    
    // Configure renderer size
    renderer.setSize( window.innerWidth, window.innerHeight );
    var mazeCanvas = document.getElementById("mazeCanvas");
    var scene = new THREE.Scene();
    var renderer = new THREE.WebGLRenderer({ canvas: mazeCanvas });
    var camera = new THREE.PerspectiveCamera(75, mazeCanvas.width / mazeCanvas.height, 0.1, 1000); 

    var wallGeo = new THREE.PlaneGeometry(1, .5);
    var wallMat = new THREE.MeshStandardMaterial({ color: 0x2194ce, side: THREE.DoubleSide });

    var geo = new THREE.PlaneGeometry(80, 80);

    var top = new THREE.MeshPhongMaterial({ color: 0xd86363, side: THREE.DoubleSide });
    var floor = new THREE.MeshPhongMaterial({ color: 0xbfb6a0, side: THREE.DoubleSide });
    var p = new THREE.Mesh(geo, top);
    var f = new THREE.Mesh(geo, floor);
    p.position.x = 0
    p.position.y = .5
    f.position.x = 0
    f.position.y = -.5
    f.position.z = 0
    p.rotation.x += Math.PI / 2
    f.rotation.x -= Math.PI / 2
    scene.add(p)
    scene.add(f)

    var outLight = new THREE.PointLight()
    var outLight2 = new THREE.PointLight()
    var moreLight = new THREE.PointLight()
    var playerPointLight = new THREE.PointLight(); //making mesh standard material visible
    playerPointLight.position.set(1, 1, 1)
    moreLight.position.set(3, 0, 3)
    outLight.position.set(12, -5, 6)
    outLight2.position.set(-12, -5, 6)
    scene.add(playerPointLight);
    scene.add(moreLight)
    scene.add(outLight)
    var radius = 5,
        segments = 6,
        rings = 6;

    // var sphereMaterial =
    //     new THREE.MeshLambertMaterial(
    //         {
    //             color: 0xD43001
    //         });

    //helper function to place walls where specified
    function placeWall(x, y, direction) {
        var wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.z = y;
        wall.position.x = x;

        if (direction == 'n') {
            wall.position.z -= 0.5;
        }
        else if (direction == 'e') {
            wall.position.x += 0.5;
            wall.rotation.y = -Math.PI / 2;
        }
        else if (direction == 's') {
            wall.position.z += 0.5;
            wall.rotation.y = Math.PI;
        }
        else if (direction == 'w') {
            wall.position.x -= 0.5;
            wall.rotation.y = Math.PI / 2;
        }
        else {
            return false;
        }

        scene.add(wall);
    }
    //setting each cell's walls
    function Cell(north, east, south, west) {
        this.north = north;
        this.east = east;
        this.south = south;
        this.west = west;
    }

    //maze from top-down is 2d viewed as rows with each row having cells
    var cells = [[], [], [], []];
    cells[0][0] = new Cell(true, false, true, true);
    cells[0][1] = new Cell(true, false, true, false);
    cells[0][2] = new Cell(true, false, true, false);
    cells[0][3] = new Cell(true, true, false, false);

    cells[1][0] = new Cell(false, false, false, true);
    cells[1][1] = new Cell(true, false, true, false);
    cells[1][2] = new Cell(true, false, true, false);
    cells[1][3] = new Cell(false, true, true, false);

    cells[2][0] = new Cell(false, false, true, true);
    cells[2][1] = new Cell(true, false, true, false);
    cells[2][2] = new Cell(true, false, true, false);
    cells[2][3] = new Cell(true, true, false, false);

    cells[3][3] = new Cell(false, true, true, false);
    cells[3][2] = new Cell(true, false, true, false);
    cells[3][1] = new Cell(true, false, true, false);
    cells[3][0] = new Cell(true, false, true, false);

    //placing the wall according to the cell wall relationships described incells
    cells.forEach(function (mazeRow, rowCount) {
        mazeRow.forEach(function (Cell, colCount) {
            if (Cell.north)
                placeWall(colCount, rowCount, 'n');
            if (Cell.east)
                placeWall(colCount, rowCount, 'e');
            if (Cell.south)
                placeWall(colCount, rowCount, 's');
            if (Cell.west)
                placeWall(colCount, rowCount, 'w');
        });
    });

    //player direction
    const NORTH = 100;
    const EAST = 101;
    const WEST = 102;
    const SOUTH = 103;

    var direction = NORTH;

    const MOVING_FORWARD = 4;
    const MOVING_BACK = 5;

    var walkDistance = 0;
    var startX = 0;
    var startZ = 0;

    //turn state view
    const WAITING = 1;
    const TURNING_RIGHT = 2;
    const TURNING_LEFT = 3;

    var state = WAITING;

    var currentDirection = 0;
    var turningArc = 0;

    var render = function () {
        requestAnimationFrame(render);

        if (playerInput.left) {
            camera.rotation.y += 0.1;
        }

        else if (playerInput.right) {
            camera.rotation.y -= 0.1;
        }

        if (state == WAITING) {
            if (playerInput.left) {
                state = TURNING_LEFT;
                switch (direction) {
                    case NORTH:
                        direction = WEST;
                        break;
                    case EAST:
                        direction = NORTH;
                        break;
                    case SOUTH:
                        direction = EAST;
                        break;
                    case WEST:
                        direction = SOUTH;
                        break;
                }
            }

            else if (playerInput.right) {
                state = TURNING_RIGHT;
                switch (direction) {
                    case NORTH:
                        direction = EAST;
                        break;
                    case EAST:
                        direction = SOUTH;
                        break;
                    case SOUTH:
                        direction = WEST;
                        break;
                    case WEST:
                        direction = NORTH;
                        break;
                }
            }

            else if (playerInput.up) {
                walkingDistance = 0;
                startX = camera.position.x;
                startZ = camera.position.z;
                state = MOVING_FORWARD;
            }

            else if (playerInput.down) {
                console.log('pp')
                walkingDistance = 0;
                startX = camera.position.x;
                startZ = camera.position.z;
                state = MOVING_BACK;
            }
        }

        if (state == TURNING_LEFT) {
            turningArc += Math.PI / 2 / 60;  //we want to turn 90 degrees in one second with every input refresh rate is 60per sec

            if (turningArc >= Math.PI / 2) {
                turningArc = Math.PI / 2;
                currentDirection = currentDirection + turningArc;  //update current direction (starting at 0) by +- 90 degrees every time a player turns
                turningArc = 0;  //reset arc
                state = WAITING;  //reset state and wait for next input
            }
           
            camera.rotation.y = currentDirection + turningArc;
        }

        if (state == TURNING_RIGHT) {
            turningArc += Math.PI / 2 / 60;

            if (turningArc >= Math.PI / 2) {
                turningArc = Math.PI / 2;
                currentDirection = currentDirection - turningArc;
                turningArc = 0;
                state = WAITING;
            }
            camera.rotation.y = currentDirection - turningArc;
        }
        
        if (state == MOVING_FORWARD) {
            console.log('hit')
            walkingDistance += 1 / 30;

            if (walkingDistance >= 1) {
                walkingDistance = 1;
                state = WAITING;
            }

            switch (direction) {
                case NORTH:
                    camera.position.z = startZ - walkingDistance;
                    break;
                case EAST:
                    camera.position.x = startX + walkingDistance;
                    break;
                case SOUTH:
                    camera.position.z = startZ + walkingDistance;
                    break;
                case WEST:
                    camera.position.x = startX - walkingDistance;
                    break;
            }
        }

        if (state == MOVING_FORWARD) {
            walkingDistance += 1 / 30;

            if (walkingDistance >= 1) {
                walkingDistance = 1;
                state = WAITING;
            }

            switch (direction) {
                case NORTH:
                    camera.position.z = startZ - walkingDistance;
                    break;
                case EAST:
                    camera.position.x = startX + walkingDistance;
                    break;
                case SOUTH:
                    camera.position.z = startZ + walkingDistance;
                    break;
                case WEST:
                    camera.position.x = startX - walkingDistance;
                    break;
            }
        }

        if (state == MOVING_BACK) {
            console.log('hit')
            walkingDistance += 1 / 30;

            if (walkingDistance >= 1) {
                walkingDistance = 1;
                state = WAITING;
            }

            switch (direction) {
                case NORTH:
                    camera.position.z = startZ + walkingDistance;
                    break;
                case EAST:
                    camera.position.x = startX - walkingDistance;
                    break;
                case SOUTH:
                    camera.position.z = startZ - walkingDistance;
                    break;
                case WEST:
                    camera.position.x = startX + walkingDistance;
                    break;
            }
        }

        renderer.render(scene, camera);
    };


    render();
}