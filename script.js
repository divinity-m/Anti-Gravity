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
}
const portal = {
    x: cnv.width/5, y: cnv.height - cnv.height/3,
    r: 17.5, rotation: 0, spinSpeed: Math.PI/24,
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


// Functions //
function swapGravity() {
    // Determines the falling direciton and changes the values of gravity and dGravity acoordingly
    if (!isMidAir) {
        fallingDirection = fallingDirection === "down" ? "up" : "down";
        gravity = fallingDirection === "down" ? 1 : -1;
        dGravity = fallingDirection === "down" ? 0.25 : -0.25;
    }
}

function drawCircle(x, y, r, fill = true) {
    // takes in the 'x' and 'y' parameters for location and the 'r' and 'fill' parameters for design

    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI*2, 0);
    if (fill) ctx.fill();
    else ctx.stroke();
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


    // player & rotation
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);

    ctx.fillStyle = "black";
    drawCircle(0, 0, player.r, true);
    ctx.drawImage(document.getElementById("grey-ball"), -25, -28, player.r * 3, player.r * 3);

    // ctx.fillStyle = "white";
    // drawCircle(0, -player.r+7, 5, true);
    // drawCircle(0, player.r-7, 5, true);
    // drawCircle(-player.r+7, 0, 5, true);
    // drawCircle(player.r-7, 0, 5, true);
    
    ctx.restore();


    // player movement
    if (aPressed) {
        player.x -= player.speed;
        player.rotation -= player.spinSpeed;
    }
    if (dPressed) {
        player.x += player.speed;
        player.rotation += player.spinSpeed;
    }

    // gravity
    const midAirDown = player.y + player.r + gravity < cnv.height-borderHeight;
    const midAirUp = player.y - player.r + gravity > borderHeight;
    
    isMidAir = fallingDirection === "down" ? midAirDown : midAirUp;
    if (isMidAir) {
        if (fallingDirection === "down") gravity = Math.min(gravity + dGravity, 7.5);
        else gravity = Math.max(gravity + dGravity, -7.5);
        player.y += gravity;
    }

    if (fallingDirection === "down" && !isMidAir) player.y = cnv.height-borderHeight - player.r;
    if (fallingDirection === "up" && !isMidAir) player.y = borderHeight + player.r;

    
    // map restrictions
    if (player.x - player.r < -80) player.x = cnv.width + 80 - player.r;
    if (player.x + player.r > cnv.width + 80) player.x = -80 + player.r;

    
    // portal
    ctx.fillStyle = "black";
    drawCircle()

    requestAnimationFrame(draw);
}

draw();
