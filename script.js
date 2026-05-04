/// SCRIPT.JS ANTI GRAVITY ///

// Canvas Setup //
const cnv = document.getElementById("game-canvas");
const ctx = cnv.getContext("2d");


// Global Variables //
let now = Date.now();
let wPressed, aPressed, sPressed, dPressed;

let [gravity, dGravity] = [0, 0.75];
let [fallingDirection, isMidAir] = ["down", false];

let [levels, currentLvlNum] = [[], 0];

// objects
const player = {
    x: cnv.width/5, y: cnv.height - cnv.height/3,
    r: 17.5, rotation: 0, spinSpeed: Math.PI/16,
    speed: 5,
    facingAngle: 0, enteringPortal: false,
}
const portal = {
    x: cnv.width - cnv.width/5, y: cnv.height/2,
    r: 40, rotation: 0, spinSpeed: Math.PI/128,
    timeSinceEntered: Date.now(),
}

// classes
class Obstacle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

/*
data for @param
{string} - Text like "Hello World".
{number} - Integers or floats (e.g., 10, 3.14)
{boolean}  - true or false.
{null}
{undefined}
{symbol}
{Object} - A generic object.
{Array} - A generic array.
*/

class Level {
    /**
    * @param {number} number - The levels id
    * @param {Array} spawnPoint - The players spawnpoint
    * @param {Array} portalCoord - The portals spawnpoint
    * @param {Array} obstacles - An array of all of the obstacles in the level
    */
    constructor(number, spawnPoint, portalCoord, obstacles) {
        this.number = number;
        this.spawnPoint = spawnPoint;
        this.portalCoord = portalCoord;
        this.obstacles = obstacles;
    }
}

let level1 = new Level(1, [cnv.width/5, cnv.height - cnv.height/3], [cnv.width - cnv.width/5, cnv.height/2], []);


// Inputs //
document.addEventListener("keydown", keydownHandler);
document.addEventListener("keyup", keyupHandler);


// Handlers //
function keydownHandler(e) {
    // handles the logic for the "keydown" event listener

    const key = e.code;

    if (key === "KeyW" || key === "ArrowUp") {
        wPressed = true;
        swapGravity();
    }
    if (key === "KeyA" || key === "ArrowLeft") aPressed = true;
    if (key === "KeyS" || key === "ArrowDown") sPressed = true;
    if (key === "KeyD" || key === "ArrowRight") dPressed = true;
}

function keyupHandler(e) {
    // handles the logic for the "keyup" event listener
    
    const key = e.code;
    
    if (key === "KeyW" || key === "ArrowUp") wPressed = false;
    if (key === "KeyA" || key === "ArrowLeft") aPressed = false;
    if (key === "KeyS" || key === "ArrowDown") sPressed = false;
    if (key === "KeyD" || key === "ArrowRight") dPressed = false;
}

// Draw Function //
function draw() {
    now = Date.now();
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    
    // background
    ctx.fillStyle = "rgb(200, 200, 200)";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    // floor & roof
    const borderHeight = cnv.height/5;
    ctx.fillStyle = "rgb(150, 150, 150)";
    ctx.fillRect(0, cnv.height-borderHeight, cnv.width, borderHeight);
    ctx.fillRect(0, 0, cnv.width, borderHeight);

    // player movement
    let previousX = player.x;
    let previousY = player.y;
    playerMovement();

    // gravity
    ImposeNaturalGravity(borderHeight);

    // update the player's angle when the player is moving
    if ((player.y - previousY !== 0 || player.x - previousX !== 0) && !player.enteringPortal) {
        player.facingAngle = Math.atan2(player.y - previousY, player.x - previousX);
    }

    // map restrictions
    if (player.x - player.r < -80) player.x = cnv.width + 80 - player.r;
    if (player.x + player.r > cnv.width + 80) player.x = -80 + player.r;

    // portal mechanics
    drawPortal();
    ImposePortalGravity();
    proceedToNextLevel();

    // draw the player as the final layer
    drawPlayer();
    
    requestAnimationFrame(draw);
}

draw();
