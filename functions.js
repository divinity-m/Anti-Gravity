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
    mouseY = (e.clientY - rect.top) * scaleY;
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

    // checks if the player is mounted on a block by checking if any existing obstacle has a true `playerGrounded` property
    const currentLevel = allLevels.find((level) => level.number === currentLvlNum);
    
    blockExists = currentLevel.obstacles.find((block) => block.playerGrounded);
    
    onObstacle = blockExists ? true : false;
    if (onObstacle) resetGravity();

    // imposes gravity based on the direction the player is falling (if the player isn't influenced by something else)
    if (isMidAir && !player.enteringPortal && !onObstacle) {
        if (fallingDirection === "down") gravity = Math.min(gravity + dGravity, 10);
        else gravity = Math.max(gravity + dGravity, -10);

        player.y += gravity;
    }

    const notInfluenced = !isMidAir && !player.enteringPortal && !onObstacle;

    if (fallingDirection === "down" && notInfluenced) player.y = cnv.height-borderHeight - player.r;
    if (fallingDirection === "up" && notInfluenced) player.y = borderHeight + player.r;
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
        
        const clampSpeed = Math.max(portalDist / portalRange, 0.2);

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
    // proceedToNextLevel(): finds the next level then sets the player's & the portal's coordinates to that of the level's
    
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

function setUpLevels() {
    // setUpLevels(): creates every single level in the game

    // LEVEL 1
    const levelOnePortalCoord = [cnv.width - cnv.width/5, cnv.height - cnv.height/3];
    const levelOnePlayerSpawn = [cnv.width/5, cnv.height/2];

    const levelOne = new Level(1, "grassy", [], levelOnePortalCoord, levelOnePlayerSpawn); // Level(number, obstacles, portalCoord, playerSpawn)

    levelOne.addText(cnv.width/10, cnv.height/2, "Press A/D or ⇐/⇒ to move around", 15, "left");
    
    allLevels.push(levelOne);

    // call proceedToNextLevel() to actualize level 1's values 
    currentLvlNum = 0;
    proceedToNextLevel();
    

    // Set Up The Following Levels
    for (let i = 1; i < 11; i++) {
        const previousLevel = allLevels[i-1];

        // by default, the portal coordinates simply reflect where the last portal originally was
        const portalIsOnTheRightSide = previousLevel.portalCoord[0] > cnv.width/2;
        
        const portalCoordX = portalIsOnTheRightSide ? cnv.width/5 : cnv.width - cnv.width/5;
        const portalCoord = [portalCoordX, cnv.height/2];

        // levels 1-5 & 11 are grassy, levels 6-10 are rocky
        const terrain = (i+1 <= 5 || i+1 === 11) ? "grassy" : "rocky";

        // playerSpawn's default value is the players current coordinates
        const newLevel = new Level(i+1, terrain, [], portalCoord);
        allLevels.push(newLevel);
    }
    

    // LEVEL 2
    const levelTwo = allLevels.find((level) => level.number === 2);

    levelTwo.addText(cnv.width-cnv.width/10, cnv.height/2, "Press W or ⇑ to swap gravity", 15, "right");
    
    levelTwo.addBlock(cnv.width/2-50, cnv.height*0.725, 200, 40);

    
    // LEVEL 11 (Finale)
    const levelEleven = allLevels.find((level) => level.number === 11);
    levelEleven.portalCoord = [-500, -500]; // No Portal
    levelEleven.playerSpawn = [cnv.width/2, cnv.height/2]; // Center
}

function checkObstacleCollisions() {
// drawObstacles(): loops through the current level's obstacles to check their collisions
    const currentLevel = allLevels.find((level) => level.number === currentLvlNum);
    
    for (let i in currentLevel.obstacles) {
        currentLevel.obstacles[i].checkCollisions();
    }
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
    // drawObstacles(): loops through the current level's obstacles and draws all of them
    const currentLevel = allLevels.find((level) => level.number === currentLvlNum);
    
    for (let i in currentLevel.obstacles) {
        currentLevel.obstacles[i].draw();
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
    ctx.fillText("This Took Forever", cnv.width/2, cnv.height/6-20);
    ctx.fillText("Credits to Gavin Diep For The Art", cnv.width/2, cnv.height/6);
}
