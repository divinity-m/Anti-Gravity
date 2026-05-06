/// SCRIPT.JS ANTI GRAVITY ///

// Canvas Setup //
const cnv = document.getElementById("game-canvas");
const ctx = cnv.getContext("2d");
let gameState = "startScreen";


// Global Variables //
let now = Date.now();
let wPressed, aPressed, sPressed, dPressed;

let [gravity, dGravity] = [0, 0.75];
let [fallingDirection, isMidAir] = ["down", false];

let [allLevels, currentLvlNum] = [[], 0];

let mouseX, mouseY;

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

const playBtn = {
    x: cnv.width/2 - 150/2, y: cnv.height/2 - 75/2,

    w: 150, h: 75,

    effect() {
        gameState = "levels";
    }
}

// classes

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

class Obstacle {
    // Obstacle: An object that has its own collision properties

    /**
    * @param {number} x - The obstacle's x coordinate
    * @param {number} y - The obstacle's y coordinate
    * @param {number} w - The obstacle's width
    * @param {number} h - The obstacle's x height
    */
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

class Level {
    // Level: A singular stage with its own unique obstacles

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

const levelOnePlayerSpawn = [cnv.width/5, cnv.height - cnv.height/3];
const levelOnePortalCoord = [cnv.width - cnv.width/5, cnv.height/2];

const levelOne = new Level(1, levelOnePlayerSpawn, levelOnePortalCoord, []);
allLevels.push(levelOne);

// Inputs //
document.addEventListener("keydown", keydownHandler);
document.addEventListener("keyup", keyupHandler);

document.addEventListener("mousemove", mouseMoveHandler);
document.addEventListener("click", clickHandler);

// Draw Function //
function draw() {
    now = Date.now();
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    
    // background
    ctx.fillStyle = "rgb(200, 200, 200)";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    // backdrop
    ctx.drawImage(document.getElementById("backdrop"), 0, 0, cnv.width, cnv.height);

    // floor & roof baseplate
    const borderHeight = cnv.height/5;
    // ctx.fillStyle = "rgb(150, 150, 150)";
    // ctx.fillRect(0, cnv.height-borderHeight, cnv.width, borderHeight);
    // ctx.fillRect(0, 0, cnv.width, borderHeight);

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

    // portal mechanics, levels, and obstacles
    currentLvlNum = 1;
    ImposePortalGravity();
    proceedToNextLevel();

    // visuals
    if (gameState === "startScreen") {
        drawStartScreen();
    }
    else if (gameState === "levels") {
        drawObstacles();
        drawPortal();
        drawPlayer();
    }
    
    // grass floor
    ctx.drawImage(document.getElementById("plane"), 0, cnv.height - borderHeight, cnv.width, borderHeight);
    ctx.drawImage(document.getElementById("grass"), 0, cnv.height - borderHeight - 9, cnv.width, 20);

    // top bar
    ctx.drawImage(document.getElementById("cloud-bar"), 0, borderHeight-0.5, cnv.width, 10);
    ctx.drawImage(document.getElementById("top-bar"), 0, 0, cnv.width, borderHeight);
    
    // repeat the animation
    requestAnimationFrame(draw);
}

draw();
