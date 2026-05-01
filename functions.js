/// FUNCTIONS.JS ANTI GRAVITY ///

function swapGravity() {
    // swapGravity(): Determines the players falling direciton and changes the values of gravity and dGravity acoordingly
    if (!isMidAir) {
        fallingDirection = fallingDirection === "down" ? "up" : "down";
        gravity = fallingDirection === "down" ? 3 : -3;
        dGravity = fallingDirection === "down" ? 0.25 : -0.25;
    }
}


// Draw functions

function drawCircle(x, y, r, lw = 0) {
    // takes in the 'x' and 'y' parameters for location and the 'r' and 'fill' parameters for design

    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI*2, 0);
    if (lw === 0) ctx.fill();
    else {
        ctx.lineWidth = lw;
        ctx.stroke();
    }
}

function drawPlayer() {
    // drawPlayer(): draws the player and handles it's rotation

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);

    ctx.drawImage(document.getElementById("grey-ball"), -player.r * 1.5, -player.r * 1.5, player.r * 3, player.r * 3);

    ctx.restore();
}

function imposeGravity(borderHeight) {
    // imposeGravity(): checks if the player is falling to apply the gravity mechanic

    if (player.enteringPortal) return;

    const midAirDown = player.y + player.r + gravity < cnv.height-borderHeight;
    const midAirUp = player.y - player.r + gravity > borderHeight;
    
    isMidAir = fallingDirection === "down" ? midAirDown : midAirUp;
    if (isMidAir) {
        if (fallingDirection === "down") gravity = Math.min(gravity + dGravity, 10);
        else gravity = Math.max(gravity + dGravity, -10);

        player.y += gravity;
    }

    if (fallingDirection === "down" && !isMidAir) player.y = cnv.height-borderHeight - player.r;
    if (fallingDirection === "up" && !isMidAir) player.y = borderHeight + player.r;
}
