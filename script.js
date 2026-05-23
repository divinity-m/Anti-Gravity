/// SCRIPT.JS ANTI GRAVITY ///

// Canvas Setup //
const cnv = document.getElementById("game-canvas");
const ctx = cnv.getContext("2d");
let gameState = "titleScreen";


// Global Variables //
let now = Date.now();

const borderHeight = cnv.height/5;
const dirtColor = "rgb(143, 89, 43)";
const grassColor = "rgb(42, 191, 42)";
const lightGrassColor = "rgb(82, 213, 82)";
const cloudColor = "rgba(237, 253, 255, 0.8)";
const cloudColor2 = "rgba(218, 251, 255, 0.8)";
const rockColor = "rgb(81, 79, 77)";
const phaseColor = "rgba(81, 79, 77, 0.7)";

let wPressed, aPressed, sPressed, dPressed;

let [gravity, dGravity] = [0, 0.75];
let [fallingDirection, isMidAir, onObstacle] = ["down", false, false];

let [allLevels, currentLvlNum] = [[], 0];

let mouseX, mouseY;

// objects
const player = {
    x: cnv.width/5, y: cnv.height - cnv.height/3,

    r: 17.5, rotation: 0, spinSpeed: Math.PI/16,
    
    speed: 5, facingAngle: 0,
    
    enteringPortal: false,

    phasing: false,

    phase() {
        if (!this.phasing && isMidAir && !onObstacle) {
            this.phasing = true;
            resetGravity();
        }
    },
    checkPhase() {
        if (!isMidAir || onObstacle) {
            this.phasing = false;
            resetGravity();
        }
        if (this.enteringPortal) {
            this.phasing = true;
        }
    },
}

const portal = {
    x: cnv.width - cnv.width/5, y: cnv.height/2,

    r: 40, rotation: 0, spinSpeed: Math.PI/128,

    timeSinceEntered: Date.now(),
}

const playBtn = {
    x: cnv.width/2 - 150/2, y: cnv.height/2 - 75/2,

    w: 150, h: 75,

    bgColor: "rgba(255, 255, 255, 0)",

    effect() {
        gameState = "levels";
    }
}

// classes
/*
data types to remember for @param
{string} - Text like "Hello World"
{number} - Integers or floats (e.g., 10, 3.14)
{boolean}  - true or false
{null}
{undefined}
{symbol}
{Object} - A generic object
{Array} - A generic array
*/

class Obstacle {
    // Block: A template class for classes involved in level creation

    /**
    * @param {number} x - The obstacles's x coordinate
    * @param {number} y - The obstacles's y coordinate
    * @param {string} variant - The specific design/type of the obstacle
    * @param {integer} rotation - How much the obstacle is rotated in radians
    * @param {string} color - The obstacles's fillStyle/strokeStyle
    */
    
    constructor(x, y, variant, rotation, color) {
        this.x = x;
        this.y = y;
        this.variant = variant;
        this.rotation = rotation;
        this.color = color;
    }

    draw() {
        // Obstacle.draw(): A template method for inheritance, classes which inherit it would use JS canvas to draw their design
    }

    checkCollisions() {
        // Obstacle.checkCollisions(): A template method for inheritance, classes which inherit it would run multiple checks to detect player collisions
    }
}

class Block extends Obstacle {
    // Block: A harmless rectangle that has its own collision properties

    /**
    * @param {number} w - The block's width
    * @param {number} h - The block's height
    * @param {boolean} collisions - Determines if the block has collision properties
    */
    constructor(x, y, w, h, variant, rotation = 0, collisions = true, color = "gray") {
        super(x, y, variant, rotation, color);
        this.w = w;
        this.h = h;
        this.collisions = collisions;
        this.type = "block";
        this.playerGrounded = false;
    }

    draw() {
        // Block.draw(): draws the block
        ctx.fillStyle = this.color;

        ctx.save();
        ctx.translate(this.x+this.w/2, this.y+this.h/2);
        ctx.rotate(this.rotation);
        
        if (this.variant === "normal" || this.variant === "phase") ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);

        if (this.variant === "tallGrass") ctx.drawImage(document.getElementById("tall-grass-platform"), -this.w/2, -this.h/2, this.w, this.h);

        if (this.variant === "shortGrass") ctx.drawImage(document.getElementById("short-grass-platform"), -this.w/2, -this.h/2, this.w, this.h);

        if (this.variant === "cloud") {
            ctx.drawImage(document.getElementById("cloud-platform"), -this.w/2-this.w*0.1, -this.h/2-this.h*0.1, this.w*1.2, this.h*1.2);
            ctx.drawImage(document.getElementById("cloud-platform-fluff"), -this.w/2-this.w*0.075, -this.h/2-this.h*0.075, this.w*1.15, this.h*1.15);
        }

        if (this.variant === "horiz-rock") {
            ctx.drawImage(document.getElementById("horiz-rock-platform"), -this.w/2, -this.h/2, this.w, this.h);
        }
        if (this.variant === "vert-rock") {
            ctx.drawImage(document.getElementById("vert-rock-platform"), -this.w/2, -this.h/2, this.w, this.h);
        }

        ctx.restore();
    }

    checkCollisions() {
        // Block.checkCollisions(): checks if the player is colliding with the block by comparing coordinates
        const fallingUpIntoBlock = (
            player.y - player.r > this.y + this.h + gravity && player.y - player.r + gravity*0.4 < this.y + this.h &&
            player.x + player.r > this.x + player.speed && player.x - player.r < this.x + this.w - player.speed
        );

        const fallingDownIntoBlock = (
            player.y + player.r + gravity*0.4 > this.y && player.y + player.r < this.y + gravity &&
            player.x + player.r > this.x + player.speed && player.x - player.r < this.x + this.w - player.speed
        );

        const movingRightIntoBlock = (
            player.x + player.r > this.x - player.speed*0.3 && player.x + player.r < this.x + player.speed &&
            player.y + player.r > this.y && player.y - player.r < this.y + this.h
        );

        const movingLeftIntoBlock = (
            player.x - player.r > this.x + this.w - player.speed && player.x - player.r < this.x + this.w + player.speed*0.3 &&
            player.y + player.r > this.y && player.y - player.r < this.y + this.h
        );

        // checks if the conditions are right to allow the player to phase through the block
        const notPhasing = this.variant === "phase" && !player.phasing;

        if ((this.variant !== "phase" || notPhasing) && this.collisions) {
            this.playerGrounded = fallingUpIntoBlock || fallingDownIntoBlock;
    
            if (fallingUpIntoBlock) player.y = this.y + this.h + player.r - gravity*0.2;
            if (fallingDownIntoBlock) player.y = this.y - player.r - gravity*0.2;
    
            if (movingRightIntoBlock) player.x = this.x - player.r - player.speed*0.31;
            if (movingLeftIntoBlock) player.x = this.x + this.w + player.r + player.speed*0.31;
        }
    }
}

class Spike extends Obstacle {
    // Block: A harmless rectangle that has its own collision properties

    /**
    * @param {string} size - The spikes overall height and width
    */
    constructor(x, y, size, variant, rotation = 0, color = "gray") {
        super(x, y, variant, rotation, color);
        this.size = size;
        this.type = "spike";
    }

    draw() {
        // Spike.draw(): draws the spike
        ctx.fillStyle = this.color;

        ctx.save();
        ctx.translate(this.x+this.size/2, this.y+this.size/2);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        
        if (this.variant.toLowerCase().includes("normal")) {
            ctx.moveTo(0, -this.size/2);
            ctx.lineTo(this.size/2, this.size/2);
            ctx.lineTo(-this.size/2, this.size/2);
        }
        if (this.variant.toLowerCase().includes("wide")) {
            ctx.moveTo(0, -this.size/4);
            ctx.lineTo(this.size/2, this.size/4);
            ctx.lineTo(-this.size/2, this.size/4);
        }

        ctx.fill();

        // spike hitbox visualization
        ctx.strokeStyle = "red";
        ctx.lineWidth = 0.5;
        if (this.variant.toLowerCase().includes("normal")) {
            // ctx.strokeRect(-this.size/2 + this.size*0.325, -this.size/2, this.size*0.35, this.size);
        }
        if (this.variant.toLowerCase().includes("wide")) {
            // ctx.strokeRect(-this.size/2 + this.size*0.325, -this.size/4, this.size*0.35, this.size/2);
        }
        
        ctx.restore();
    }

    checkCollisions() {
        // Spike.checkCollisions(): checks if the player is colliding with the spike, spikes have a rectangular hitbox
        let playerHitSpike;
        if (this.variant === "normal" || this.variant === "phaseNormal")  {
            playerHitSpike = (
                player.x+player.r > this.x+this.size*0.325 && player.x - player.r < this.x+this.size*0.325+this.size*0.35 &&
                player.y+player.r > this.y && player.y-player.r < this.y+this.size
            );
        }
        if (this.variant === "wide" || this.variant === "phaseWide")  {
            playerHitSpike = (
                player.x+player.r > this.x+this.size*0.325 && player.x - player.r < this.x+this.size*0.325+this.size*0.35 &&
                player.y+player.r > this.y+this.size/4 && player.y-player.r < this.y+this.size*0.75
            );
        }
        
        const notPhasing = this.variant.includes("phase") && !player.phasing;

        if (!this.variant.includes("phase") || notPhasing) {
            if (playerHitSpike) respawnPlayer();
        }
    }
}

class Text extends Obstacle {
    // Text: A string of text to display information

    /**
    * @param {string} content - The words in the text
    * @param {number} size - The text's size (in px)
    * @param {string} align - Where to align the text (left, centre, or right)
    */
    constructor(x, y, size, content, align, variant = "fill", rotation = 0, color = "gray") {
        super(x, y, variant, rotation, color);
        this.size = size;
        this.content = content;
        this.align = align;
        this.type = "text";
    }

    draw() {
        // Text.draw(): draws the text using the object's parameters
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.font = `${this.size}px Outfit`;
        ctx.textAlign = this.align;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.variant === "fill") ctx.fillText(this.content, 0, 0);
        else {
            ctx.lineWidth = this.variant;
            ctx.strokeText(this.content, 0, 0);
        }
        
        ctx.restore();
    }
}

class Level {
    // Level: A singular stage with its own unique obstacles

    /**
    * @param {number} number - The level's id
    * @param {string} terrain - The level's overall design
    * @param {Array} obstacles - An array of all of the obstacles in the level
    * @param {Array} portalCoord - The portal's coordinates
    * @param {Array} playerSpawn - The player's spawnpoint
    */
    constructor(number, terrain, obstacles, portalCoord, playerSpawn = []) {
        this.number = number;
        this.terrain = terrain;
        this.obstacles = obstacles;
        this.portalCoord = portalCoord;
        this.playerSpawn = playerSpawn;
    }

    addBlock(x, y, w, h, variant = "normal", rotation = 0, collisions = true, color = "gray") {
        // Level.addBlock(): pushes a block object into the level's obstacles array
        this.obstacles.push(new Block(x, y, w, h, variant, rotation, collisions, color));
    }
    
    addSpike(x, y, size, variant = "normal", rotation = 0, color = "gray") {
        // Level.addSpike(): pushes a spike object into the level's obstacles array
        this.obstacles.push(new Spike(x, y, size, variant, rotation, color));
    }

    addText(x, y, size, content, align, variant = "fill", rotation = 0, color = "gray") {
        // Level.addText(): pushes a text object into the level's obstacles array
        this.obstacles.push(new Text(x, y, size, content, align, variant, rotation, color));
    }
}

setUpLevels();


// Inputs //
document.addEventListener("keydown", keydownHandler);
document.addEventListener("keyup", keyupHandler);

document.addEventListener("mousemove", mouseMoveHandler);
document.addEventListener("click", clickHandler);


// Draw Function //
function draw() {
    // draw(): the main function which is repeated to call other process and draw functions
    now = Date.now();
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    
    // background
    ctx.fillStyle = "rgb(200, 200, 200)";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    // backdrop
    const currentLevel = allLevels.find((level) => level.number === currentLvlNum);

    if (currentLevel.terrain === "grassy") {
        ctx.drawImage(document.getElementById("sky-backdrop"), 0, 0, cnv.width, cnv.height);
    }
    else if (currentLevel.terrain === "rocky") {
        ctx.drawImage(document.getElementById("cave-backdrop"), 0, 0, cnv.width, cnv.height);
    }

    // title screen
    if (gameState === "titleScreen") drawTitleScreen();
    else if (gameState === "levels") {
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
        if (player.x - player.r < -70) player.x = cnv.width + 70 - player.r;
        if (player.x + player.r > cnv.width + 70) player.x = -70 + player.r;

        
        // portal mechanics, levels, and obstacles
        ImposePortalGravity();
        
        if (player.enteringPortal && now - portal.timeSinceEntered > 2500) proceedToNextLevel(); // waits for 2.5s before moving on

        checkObstacleCollisions();
        
        
        // content visuals
        drawPortal();
        drawPlayer();
        drawObstacles();
    }
    
    // bottom bar
    if (currentLevel.terrain === "grassy") {
        ctx.drawImage(document.getElementById("grass-bar"), 0, cnv.height - borderHeight, cnv.width, borderHeight);
        ctx.drawImage(document.getElementById("grass-blades"), 0, cnv.height - borderHeight - 9, cnv.width, 20);
    }
    else if (currentLevel.terrain === "rocky") {
        ctx.fillStyle = "rgb(60, 61, 64)";
        ctx.fillRect(0, cnv.height-borderHeight, cnv.width, borderHeight);
        // ctx.drawImage(document.getElementById("cave-bar"), 0, cnv.height - borderHeight, cnv.width, borderHeight);
    }

    if (gameState === "titleScreen") drawCursor();

    // top bar
    if (currentLevel.terrain === "grassy") {
        ctx.drawImage(document.getElementById("cloud-fluff"), 0, borderHeight-0.5, cnv.width, 10);
        ctx.drawImage(document.getElementById("cloud-bar"), 0, 0, cnv.width, borderHeight);
    }
    else if (currentLevel.terrain === "rocky") {
        ctx.fillStyle = "rgb(60, 61, 64)";
        ctx.fillRect(0, 0, cnv.width, borderHeight);
        // ctx.drawImage(document.getElementById("cave-bar"), 0, 0, cnv.width, borderHeight);
    }
    
    // repeat the animation
    requestAnimationFrame(draw);
}

draw();


function warpToLevel(levelNum, spawn) {
    gameState = "levels";

    const level = allLevels.find((level) => level.number === levelNum);
    level.playerSpawn = spawn;

    while (currentLvlNum < levelNum) {
        proceedToNextLevel();
    }
}
warpToLevel(8, [425, 130]);
// warpToLevel(7, [100, 200]);
