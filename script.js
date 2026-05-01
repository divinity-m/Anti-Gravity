/// SCRIPT.JS ANTI GRAVITY ///

// Canvas
const cnv = document.getElementById("game-canvas");
const ctx = cnv.getContext("2d");


// Global Variables //
let wPressed, aPressed, sPressed, dPressed;
let gravity = 0;
let dGravity = 0.75;
let fallingDirection = "down";
let isMidAir = false;

// objects
const player = {
    x: cnv.width/5, y: cnv.height - cnv.height/3,
    r: 17.5, rotation: 0, spinSpeed: Math.PI/16,
    speed: 5,
    facingAngle: 0, enteringPortal: true,
}
const portal = {
    x: cnv.width - cnv.width/5, y: cnv.height/2,
    r: 40, rotation: 0, spinSpeed: Math.PI/128,
}

// classes
class Obstacle {

}


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
    if (aPressed) {
        player.x -= player.speed;
        player.rotation -= player.spinSpeed;
    }
    if (dPressed) {
        player.x += player.speed;
        player.rotation += player.spinSpeed;
    }

    // gravity
    imposeGravity(borderHeight);

    player.facingAngle = Math.atan2(-(player.y - previousY), player.x - previousX);

    // map restrictions
    if (player.x - player.r < -80) player.x = cnv.width + 80 - player.r;
    if (player.x + player.r > cnv.width + 80) player.x = -80 + player.r;

    // portal
    ctx.save();
    ctx.translate(portal.x, portal.y)
    ctx.rotate(portal.rotation);
    ctx.drawImage(document.getElementById("portal-img"), -portal.r * 1.5, -portal.r * 1.5, portal.r * 3, portal.r * 3);
    ctx.restore();

    portal.rotation += portal.spinSpeed;

    // get the distance of the player from the portal
    const portalDx = portal.x - player.x;
    const portalDy = portal.y - player.y;
    const distFromPortal = Math.hypot(portalDx, portalDy);
    const angleToPortal = Math.atan2(portalDy, portalDx);
    
    ctx.fillStyle = "black";
    drawCircle(portal.x, portal.y, portal.r + 50, 2);
    if (distFromPortal < portal.r + 50) {
        player.enteringPortal = true;
        
        // slowy add the dAngle to the players angle to get the 'spin' affect as the player enters the portal
        const dAngle = (angleToPortal - player.facingAngle) / 100;
        player.facingAngle += dAngle

        player.x += portalDx/distFromPortal * 5;
        player.y += portalDy/distFromPortal * 5;
    } else player.enteringPortal = false;

    // player
    drawPlayer();
    
    requestAnimationFrame(draw);
}

draw();
