/// FUNCTIONS.JS ANTI GRAVITY ///
// Handlers //
function keydownHandler(e) {
    // keydownHandler(): handles the keyboard inputs for the "keydown" event listener

    const key = e.code;

    if (key === "KeyW" || key === "ArrowUp") {
        wPressed = true;
        if (gameState !== "titleScreen") swapGravity();
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
}

function clickHandler(e) {
    // clickHandler(): checks if the user clicks any buttons

    const rect = cnv.getBoundingClientRect();
    if (gameState === "titleScreen") {
        const mouseInPlayBtn = (
            mouseX > playBtn.x && mouseX < playBtn.x + playBtn.w &&
            mouseY > playBtn.y && mouseY < playBtn.y + playBtn.h
        )
        if (mouseInPlayBtn) gameState = "levels";
    }
}


// Process Functions //
function playerMovement() {
    // playerMovement(): checks if certain buttons are pressed to move the player
    if (aPressed) {
        if (!player.enteringPortal) player.x -= player.speed;

        player.spinSpeed = gameState !== "titleScreen" ? Math.PI/16 : Math.PI/128;

        player.rotation -= player.spinSpeed;
    }
    if (dPressed) {
        if (!player.enteringPortal) player.x += player.speed;
    
        player.spinSpeed = gameState !== "titleScreen" ? Math.PI/16 : Math.PI/128;

        player.rotation += player.spinSpeed;
    }
}

function resetGravity() {
    gravity = fallingDirection === "down" ? 3 : -3;
    dGravity = fallingDirection === "down" ? 0.25 : -0.25;
}

function swapGravity() {
    // Determines the falling direciton and changes the values of gravity and dGravity acoordingly
    if (!isMidAir || onObstacle) {
        fallingDirection = fallingDirection === "down" ? "up" : "down";
        resetGravity();
    }
}

function ImposeNaturalGravity(borderHeight) {
    // ImposeNaturalGravity(): checks if the player is falling to apply the gravity mechanic

    // checks if the player is not mounted on the bottom or top bar
    const midAirDown = player.y + player.r + gravity < cnv.height-borderHeight;
    const midAirUp = player.y - player.r + gravity > borderHeight;

    isMidAir = fallingDirection === "down" ? midAirDown : midAirUp;

    // checks if the player is mounted on an obstacle by looping through every obstacle and checking their `playerGrounded` property
    const currentLevel = allLevels.find((level) => level.number === currentLvlNum);
    onObstacle = false;

    for (let i in currentLevel.obstacles) {
        const obstacle = currentLevel.obstacles[i];
        obstacle.checkCollisions();
        if (obstacle.playerGrounded) onObstacle = true;
    }

    if (onObstacle) resetGravity();

    // imposes gravity based on the direction the player is falling (if the player isn't influenced by something else)
    if (isMidAir && !player.enteringPortal && !onObstacle) {
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
        resetGravity();

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
    // proceedToNextLevel(): checks if the player has been inside the portal long enough then creates a new level and swaps the current level to the new level

    if (player.enteringPortal && now - portal.timeSinceEntered > 2500) {
        // increment the currentLvlNum
        currentLvlNum++;
        const nextLevel = allLevels.find((level) => level.number === currentLvlNum);

        // set the portal coordinates
        portal.x = nextLevel.portalCoord[0];
        portal.y = nextLevel.portalCoord[1];

        // only set the player coordinates if they exist, otherwise, they dont change
        if (nextLevel.playerSpawn.length > 0) {
            player.x = nextLevel.playerSpawn[0];
            player.y = nextLevel.playerSpawn[1];
        }

        // force the player to fall back down
        fallingDirection = "down";
        resetGravity();
    }
}

function setUpLevels() {
    // setUpLevels(): creates every single level in the game

    // LEVEL 1
    currentLvlNum = 1;
    const levelOnePlayerSpawn = [cnv.width/5, cnv.height/2];
    const levelOnePortalCoord = [cnv.width - cnv.width/5, cnv.height/2];

    const levelOne = new Level(currentLvlNum, [], levelOnePortalCoord, levelOnePlayerSpawn);
    allLevels.push(levelOne);

    // set up the following levels
    for (let i = 1; i < 10; i++) {
        const previousLevel = allLevels[i-1];

        // the portal coordinates simply reflect where the last portal originally was
        const portalCoordX = previousLevel.portalCoord[0] > cnv.width/2 ? cnv.width/5 : cnv.width - cnv.width/5;
        const portalCoord = [portalCoordX, cnv.height/2];

        // playerSpawn's default value is the players current coordinates
        const newLevel = new Level(i+1, [], portalCoord);
        allLevels.push(newLevel);
    }

    // LEVEL 2
    const levelTwo = allLevels.find((level) => level.number === 2);

    levelTwo.addBlock(cnv.width/2-50, cnv.height/2-10, 100, 20);
}


// Draw Functions //
function drawCircle(x, y, r, lw = 0) {
    // drawCircle(): takes in the 'x' and 'y' parameters for location and the 'r' and 'fill' parameters for design

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
    // drawObstacles(): loops through the current levels obstacles and draws all of them

    const currentLevel = allLevels.find((level) => level.number === currentLvlNum);
    for (let i in currentLevel.obstacles) {
        const obstacle = currentLevel.obstacles[i];
        obstacle.draw();
    }
}

function drawTitleScreen() {
    // drawTitleScreen(): draws the games title screen, including the play button, which starts the game
    
    ctx.save();
    ctx.translate(cnv.width/2, cnv.height/2);
    ctx.rotate(player.rotation);
    ctx.drawImage(document.getElementById("grey-ball"), -player.r * 10, -player.r * 10, player.r * 20, player.r * 20);
    ctx.restore();

    // mouseX and mouseY are undefined by default, so check if they have values before using them
    let mouseInPlayBtn;
    if (mouseX && mouseY) {
        mouseInPlayBtn = (
            mouseX > playBtn.x && mouseX < playBtn.x + playBtn.w &&
            mouseY > playBtn.y && mouseY < playBtn.y + playBtn.h
        )
    }

    let playTextColor = "rgb(215, 215, 215)";
    
    // checks if mouseInPlayBtn isn't undefined before setting the color properties
    if (mouseInPlayBtn !== undefined) {
        playBtn.bgColor = mouseInPlayBtn ? "rgb(200, 200, 200)" : "rgb(170, 170, 170)";
        playTextColor = mouseInPlayBtn ? "rgb(255, 255, 255)" : "rgb(215, 215, 215)";
    }

    ctx.fillStyle = playBtn.bgColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(playBtn.x, playBtn.y, playBtn.w, playBtn.h);
    ctx.fillRect(playBtn.x, playBtn.y, playBtn.w, playBtn.h);
 

    ctx.fillStyle = playTextColor;
    ctx.font = "25px Outfit";
    ctx.textAlign = "center";
    ctx.fillText("PLAY", playBtn.x + 75, playBtn.y + 75/1.7);

    if (mouseX && mouseY) {
        ctx.fillStyle = mouseInPlayBtn ? "blue" : "red";
        drawCircle(mouseX, mouseY, 5);
    }

    ctx.fillStyle = "rgb(110, 110, 110)";
    ctx.font = "20px Outfit";
    ctx.textAlign = "center";
    ctx.fillText("Don't Use Full Screen", cnv.width/2, cnv.height/6);
}
