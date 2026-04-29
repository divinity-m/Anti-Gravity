/// SCRIPT.JS ANTI GRAVITY ///
const cnv = document.getElementById("game-canvas");
const ctx = cnv.getContext("2d");


// Global Variables //
let wPressed, aPressed, sPressed, dPressed;
let gravity = -5;
let fallingDirection = "down";
let isMidAir = false;
const player = {
    x: cnv.width/2, y: cnv.height/2,
    w: 10, h: 10, r: 15,
    speed: 3,
    rotation: 0, spinSpeed: Math.PI/12,
}

// Inputs //
document.addEventListener("keydown", keydownHandler);
document.addEventListener("keyup", keyupHandler);

// Handlers //
function keydownHandler(e) {
    const key = e.code;

    if (key === "KeyW" || key === "ArrowUp") {
        wPressed = true;
        swapGravity();
    }
    if (key === "KeyA" || key === "ArrowLeft") aPressed = true;
    if (key === "KeyS" || key === "ArrowDown") sPressed = true;
    if (key === "KeyD" || key === "ArrowRight") dPressed = true;
    console.log(key)
}

function keyupHandler(e) {
    const key = e.code;

    if (key === "KeyW" || key === "ArrowUp") wPressed = false;
    if (key === "KeyA" || key === "ArrowLeft") aPressed = false;
    if (key === "KeyS" || key === "ArrowDown") sPressed = false;
    if (key === "KeyD" || key === "ArrowRight") dPressed = false;
}

// Functions //
function swapGravity() {
    if (!isMidAir) {
        gravity *= -1
        fallingDirection = fallingDirection === "down" ? "up" : "down";
    }
}

function drawCircle(x, y, r, fill = true) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI*2, 0);
    if (fill) ctx.fill();
    else ctx.stroke();
}


// Draws the canvas
function draw() {
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    
    // background
    ctx.fillStyle = "rgb(200, 200, 200)";
    ctx.fillRect(0, 0, cnv.width, cnv.height);

    // floor
    ctx.fillStyle = "rgb(150, 150, 150)";
    ctx.fillRect(0, cnv.height-cnv.height/4, cnv.width, cnv.height/4);
    
    // roof
    ctx.fillRect(0, 0, cnv.width, cnv.height/4);

    // player
    ctx.fillStyle = "black";
    drawCircle(player.x, player.y, player.r, true);
    ctx.fillStyle = "blue";
    drawCircle(player.x, player.y-5, 5, true);

    // movement
    if (aPressed) {
        player.x -= player.speed;
        player.rotation -= player.spinSpeed;
    }
    if (dPressed) {
        player.x += player.speed;
        player.rotation += player.spinSpeed;
    }

    // rotation
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    ctx.restore();

    // gravity
    const midAirDown = player.y + player.r < cnv.height-cnv.height/4;
    const midAirUp = player.y - player.r > cnv.height/4;
    
    isMidAir = fallingDirection === "down" ? midAirDown : midAirUp;
    if (isMidAir) player.y -= gravity;

    if (fallingDirection === "down" && !isMidAir) player.y = cnv.height-cnv.height/4 - player.r;
    if (fallingDirection === "up" && !isMidAir) player.y = cnv.height/4 + player.r;

    
    requestAnimationFrame(draw);
}
draw();
