/// FUNCTIONS.JS ANTI GRAVITY ///
// Handlers //
function keydownHandler(e) {
    // keydownHandler(): handles the keyboard inputs for the "keydown" event listener

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
    // keyupHandler(): handles the keyboard inputs for the "keyup" event listener
    
    const key = e.code;
    
    if (key === "KeyW" || key === "ArrowUp") wPressed = false;
    if (key === "KeyA" || key === "ArrowLeft") aPressed = false;
    if (key === "KeyS" || key === "ArrowDown") sPressed = false;
    if (key === "KeyD" || key === "ArrowRight") dPressed = false;
}

function mouseMoveHandler(e) {
    // mouseMoveHandler(): checks where the cursor is hovering over and updates mouseX & mouseY

    const rect = cnv.getBoundingClientRect();

    // scales the cursor coordinates to the canvas dimensions
    const scaleX = cnv.width / rect.width;
    const scaleY = cnv.height / rect.height;

    // rect.left and rect.top are both 0, so subtracting them is kinda redundant, but there may be edge cases that I might miss if I remove them from this equation
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleX * 1.05;
    
    if (gameState === "startScreen") {
        const mouseInPlayBtn = (
            mouseX > playBtn.x && mouseX < playBtn.x + playBtn.w &&
            mouseY > playBtn.y && mouseY < playBtn.y + playBtn.h
        )
        if (mouseInPlayBtn) {
            playBtn.bgColor = "rgb(175, 175, 175)";
        }
        else {
            playBtn.bgColor = "rgb(150, 150, 150)";
        }
    }
}

function clickHandler(e) {
    // checks if the user clicks any buttons

    const rect = cnv.getBoundingClientRect();
    if (gameState === "startScreen") {
        const mouseInPlayBtn = (
            mouseX > playBtn.x && mouseX < playBtn.x + playBtn.w &&
            mouseY > playBtn.y && mouseY < playBtn.y + playBtn.h
        )
        if (mouseInPlayBtn) gameState = "levels"
    }
}

// Process Functions //
function playerMovement() {
    if (aPressed) {
        if (!player.enteringPortal) player.x -= player.speed;

        player.spinSpeed = gameState !== "startScreen" ? Math.PI/16 : Math.PI/128;

        player.rotation -= player.spinSpeed;
    }
    if (dPressed) {
        if (!player.enteringPortal) player.x += player.speed;
    
        player.spinSpeed = gameState !== "startScreen" ? Math.PI/16 : Math.PI/128;

        player.rotation += player.spinSpeed;
    }
}

function swapGravity() {
    // Determines the falling direciton and changes the values of gravity and dGravity acoordingly
    if (!isMidAir) {
        fallingDirection = fallingDirection === "down" ? "up" : "down";
        gravity = fallingDirection === "down" ? 3 : -3;
        dGravity = fallingDirection === "down" ? 0.25 : -0.25;
    }
}

function ImposeNaturalGravity(borderHeight) {
    // ImposeNaturalGravity(): checks if the player is falling to apply the gravity mechanic

    const midAirDown = player.y + player.r + gravity < cnv.height-borderHeight;
    const midAirUp = player.y - player.r + gravity > borderHeight;
    
    isMidAir = fallingDirection === "down" ? midAirDown : midAirUp;
    if (isMidAir && !player.enteringPortal) {
        if (fallingDirection === "down") gravity = Math.min(gravity + dGravity, 10);
        else gravity = Math.max(gravity + dGravity, -10);

        player.y += gravity;
    }

    if (fallingDirection === "down" && !isMidAir) player.y = cnv.height-borderHeight - player.r;
    if (fallingDirection === "up" && !isMidAir) player.y = borderHeight + player.r;
}

function ImposePortalGravity() {
    // ImposePortalGravity(): imposes the portals 'pull' effect on the player when they get close enough

    // calculate the distance of the player from the portal
    const portalDx = portal.x - player.x;
    const portalDy = portal.y - player.y;
    const portalDist = Math.hypot(portalDx, portalDy);
    
    const portalRange = portal.r + 50;

    if (portalDist < portalRange) {
        player.enteringPortal = true;
        player.spinSpeed =  Math.PI/32;

        // the angle from the player to the portal
        const angleToPortal = Math.atan2(portalDy, portalDx);

        // gets the angular difference then normalizes it
        let dAngle = angleToPortal - player.facingAngle;
        dAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle));

        // get a turn speed proportional to the distance from the player to the portal
        const turnSpeed = 0.1;

        // add either the dAngle or the turnSpeed to the players angle
        player.facingAngle += Math.sign(dAngle) * Math.min(Math.abs(dAngle), turnSpeed);
        
        const clampSpeed = Math.max(portalDist / portalRange, 0.1);

        // move the player in the direciton of the angle
        player.x += Math.cos(player.facingAngle) * player.speed * clampSpeed;
        player.y += Math.sin(player.facingAngle) * player.speed * clampSpeed;
    }
    else {
        player.enteringPortal = false;
        player.spinSpeed =  Math.PI/16;
        portal.timeSinceEntered = now;
    }
}

function proceedToNextLevel() {
    if (player.enteringPortal && now - portal.timeSinceEntered > 2500) {
        currentLvlNum++;
        const currentLevel = allLevels.find((level) => level.number === currentLvlNum);

        player.x = currentLevel.spawnPoint[0];
        player.y = currentLevel.spawnPoint[1];
        portal.x = currentLevel.portalCoord[0];
        portal.y = currentLevel.portalCoord[1];
    }
}

// Draw Functions //
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

function drawPlayer(x, y, r, rotation) {
    // drawPlayer(): draws the player

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.rotation);
    ctx.drawImage(document.getElementById("grey-ball"), -player.r * 1.5, -player.r * 1.5, player.r * 3, player.r * 3);
    ctx.restore();
}

function drawPortal() {
    // drawPlayer(): draws the portal and handles it's rotation

    ctx.save();
    ctx.translate(portal.x, portal.y)
    ctx.rotate(portal.rotation);
    ctx.drawImage(document.getElementById("portal-img"), -portal.r * 1.5, -portal.r * 1.5, portal.r * 3, portal.r * 3);
    ctx.restore();

    portal.rotation += portal.spinSpeed;
}

function drawObstacles() {
    // drawObstacles(): loops through the current levels obstacles and draws all them

    const currentLevel = allLevels.find((level) => level.number === currentLvlNum);
    for (let i in currentLevel.obstacles) {
        const obstacle = currentLevel.obstacles[i];
    
        ctx.fillStyle = "gray"
        fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    }
}

function drawStartScreen() {
    // drawStartScreen(): draws the games start screen, including the play button, which starts the game
    
    ctx.save();
    ctx.translate(cnv.width/2, cnv.height/2);
    ctx.rotate(player.rotation);
    ctx.drawImage(document.getElementById("grey-ball"), -player.r * 10, -player.r * 10, player.r * 20, player.r * 20);
    ctx.restore();


    ctx.fillStyle = playBtn.bgdColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(playBtn.x, playBtn.y, playBtn.w, playBtn.h);
    ctx.fillRect(playBtn.x, playBtn.y, playBtn.w, playBtn.h);

    
    if (mouseX && mouseY) {
        const mouseInPlayBtn = (
            mouseX > playBtn.x && mouseX < playBtn.x + playBtn.w &&
            mouseY > playBtn.y && mouseY < playBtn.y + playBtn.h
        )

        ctx.fillStyle = mouseInPlayBtn ? "blue" : "red";
        drawCircle(mouseX, mouseY, 5);
    }
}
