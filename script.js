/// SCRIPT.JS ANTI GRAVITY ///

// Canvas Setup //
const cnv = document.getElementById("game-canvas");
const ctx = cnv.getContext("2d");
let gameState = "titleScreen";


// Global Variables //
let now = Date.now();
let wPressed, aPressed, sPressed, dPressed;

let [gravity, dGravity] = [0, 0.75];
let [fallingDirection, isMidAir, onObstacle] = ["down", false, false];

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

    bgColor: "rgb(170, 170, 170)",

    effect() {
        gameState = "levels";
    }
}

// classes
/*
data types for @param
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
    // Block: A template class for classes involved in level creation

    /**
    * @param {number} x - The obstacles's x coordinate
    * @param {number} y - The obstacles's y coordinate
    * @param {string} color - The obstacles's fillStyle/strokeStyle
    */
    
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
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
    * @param {number} x - The block's x coordinate
    * @param {number} y - The block's y coordinate
    * @param {number} w - The block's width
    * @param {number} h - The block's height
    */
    constructor(x, y, w, h, color = "gray") {
        super(x, y, color);
        this.w = w;
        this.h = h;
        this.type = "block";
        this.playerGrounded = false;
    }

    draw() {
        // Block.draw(): draws the block as either a grass platform or a plane gray slate
        ctx.fillStyle = this.color;
        
        if (currentLvlNum <= 5) ctx.drawImage(document.getElementById("grass-platform"), this.x, this.y, this.w, this.h);
        else ctx.fillRect(this.x, this.y, this.w, this.h);
    }

    checkCollisions() {
        // Block.checkCollisions(): checks if the player is colliding with the block
        const fallingUpIntoBlock = (
            player.y + player.r > this.y + this.h*0.5 && player.y - player.r + gravity < this.y + this.h &&
            player.x + player.r + player.speed > this.x + this.w*0.1 && player.x - player.r - player.speed < this.x + this.w*0.9
        );

        const fallingDownIntoBlock = (
            player.y + player.r + gravity > this.y && player.y - player.r < this.y + this.h*0.5 &&
            player.x + player.r + player.speed > this.x + this.w*0.1 && player.x - player.r - player.speed < this.x + this.w*0.9
        );

        const movingRightIntoBlock = (
            player.x + player.r > this.x - player.speed*0.1 && player.x - player.r < this.x + this.w*0.25 &&
            player.y + player.r > this.y && player.y - player.r < this.y + this.h
        );

        const movingLeftIntoBlock = (
            player.x + player.r > this.x + this.w*0.75 && player.x - player.r < this.x + this.w + player.speed*0.1 &&
            player.y + player.r > this.y && player.y - player.r < this.y + this.h
        );

        const fallingIntoBlock = fallingUpIntoBlock || fallingDownIntoBlock;
        const movingIntoBlock = movingRightIntoBlock || movingLeftIntoBlock;

        this.playerGrounded = fallingIntoBlock ? true : false;

        if (fallingUpIntoBlock) player.y = this.y + this.h + player.r;
        if (fallingDownIntoBlock) player.y = this.y - player.r;

        if (movingRightIntoBlock) player.x = this.x - player.r - player.speed*0.1;
        if (movingLeftIntoBlock) player.x = this.x + this.w + player.r + player.speed*0.1;
    }
}


class Text extends Obstacle {
    // Text: A string of text to display information

    /**
    * @param {number} x - The text's x coordinate
    * @param {number} y - The text's y coordinate
    * @param {string} content - The words in the text
    * @param {number} size - The text's size (in px)
    * @param {string} align - Where to align the text (left, centre, or right)
    */
    constructor(x, y, content, size, align, color = "gray") {
        super(x, y, color);
        this.content = content;
        this.size = size;
        this.align = align;
        this.type = "text";
    }

    draw() {
        // Text.draw(): draws the text using the object's parameters
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px Outfit`;
        ctx.textAlign = this.align;
        ctx.fillText(this.content, this.x, this.y);
    }
}


class Level {
    // Level: A singular stage with its own unique obstacles

    /**
    * @param {number} number - The levels id
    * @param {Array} obstacles - An array of all of the obstacles in the level
    * @param {Array} portalCoord - The portal's coordinates
    * @param {Array} playerSpawn - The player's spawnpoint
    */
    constructor(number, obstacles, portalCoord, playerSpawn = []) {
        this.number = number;
        this.obstacles = obstacles;
        this.portalCoord = portalCoord;
        this.playerSpawn = playerSpawn;
    }

    addBlock(x, y, w, h, color = "gray") {
        // Level.addBlock(): pushes a block object to the level's obstacles array
        this.obstacles.push(new Block(x, y, w, h, color));
    }

    addText(x, y, content, size, align, color = "gray") {
        // Level.addText(): pushes a text object to the level's obstacles array
        this.obstacles.push(new Text(x, y, content, size, align, color));
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
    now = Date.now();
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    
    const borderHeight = cnv.height/5;
    
    // background
    ctx.fillStyle = "rgb(200, 200, 200)";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    // backdrop
    ctx.drawImage(document.getElementById("sky-backdrop"), 0, 0, cnv.width, cnv.height);

    if (gameState === "titleScreen") {
        drawTitleScreen();
    }
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
        
        if (player.enteringPortal && now - portal.timeSinceEntered > 2500) proceedToNextLevel();

        
        // collision visuals
        drawObstacles();
        drawPortal();
        drawPlayer();
    }
    
    // grass floor
    ctx.drawImage(document.getElementById("grass-bar"), 0, cnv.height - borderHeight, cnv.width, borderHeight);
    ctx.drawImage(document.getElementById("grass-detail"), 0, cnv.height - borderHeight - 9, cnv.width, 20);

    // top bar
    ctx.drawImage(document.getElementById("cloud-bar"), 0, borderHeight-0.5, cnv.width, 10);
    ctx.drawImage(document.getElementById("top-bar"), 0, 0, cnv.width, borderHeight);
    
    // repeat the animation
    requestAnimationFrame(draw);
}

draw();
