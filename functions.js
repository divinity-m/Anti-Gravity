/// FUNCTIONS.JS ANTI GRAVITY ///
// Handlers //
function keydownHandler(e) {
    // keydownHandler(): handles the keyboard inputs for the "keydown" event listener

    const key = e.code;

    if (key === "KeyW" || key === "ArrowUp") {
        wPressed = true;
        if (gameState !== "titleScreen" && currentLvlNum !== 1) swapGravity();
    }
    if (key === "KeyS" || key === "ArrowDown") {
        sPressed = true;
        if (gameState !== "titleScreen" && currentLvlNum !== 1) player.phase();
    }
    if (key === "KeyA" || key === "ArrowLeft") aPressed = true;
    if (key === "KeyD" || key === "ArrowRight") dPressed = true;
}

function keyupHandler(e) {
    // keyupHandler(): handles the keyboard inputs for the "keyup" event listener
    
    const key = e.code;
    
    if (key === "KeyW" || key === "ArrowUp") wPressed = false;
    if (key === "KeyS" || key === "ArrowDown") sPressed = false;
    if (key === "KeyA" || key === "ArrowLeft") aPressed = false;
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
        if (mouseInPlayBtn) playBtn.effect();
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
    if (!player.phasing) {
        gravity = fallingDirection === "down" ? 3 : -3;
        dGravity = fallingDirection === "down" ? 0.25 : -0.25;
    } else {
        gravity = fallingDirection === "down" ? 9 : -9;
        dGravity = fallingDirection === "down" ? 0.75 : -0.75;
    }
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

    player.checkPhase();
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
    
    const portalRange = portal.r + 45;

    // a visual of the portals range
    // ctx.strokeStyle = "blue"
    // drawCircle(portal.x, portal.y, portalRange, 2);

    if (portalDist < portalRange) {
        player.enteringPortal = true;
        player.spinSpeed =  Math.PI/32;
        resetGravity();
        player.checkPhase();

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
        player.spinSpeed = Math.PI/16;
        portal.timeSinceEntered = now;
    }
}

function proceedToNextLevel() {
    // proceedToNextLevel(): finds the next level then sets the player's & the portal's coordinates to that of the level's
    portal.timeSinceEntered = now;
    
    // increment the currentLvlNum
    currentLvlNum++;
    const nextLevel = allLevels.find((level) => level.number === currentLvlNum);

    // set the portal coordinates
    portal.x = nextLevel.portalCoord[0];
    portal.y = nextLevel.portalCoord[1];

    // only set the player coordinates if they exist, otherwise, make the spawn point where the player started the level
    if (nextLevel.playerSpawn.length > 0) {
        player.x = nextLevel.playerSpawn[0];
        player.y = nextLevel.playerSpawn[1];
    }
    else {
        nextLevel.playerSpawn = [player.x, player.y];
    }

    // force the player to fall back down
    fallingDirection = "down";
    resetGravity();
    player.phasing = false;
}

function setUpLevels() {
    // setUpLevels(): creates every single level in the game

    // LEVEL 1 (Tutorial for Left/Right movement)
    const level1PortalCoord = [800, 320];
    const level1PlayerSpawn = [200, 250];

    const level1 = new Level(1, "grassy", [], level1PortalCoord, level1PlayerSpawn); // Level(number, obstacles, portalCoord, playerSpawn)

    level1.addText(100, 250, 15, "Press A/D or ⇐/⇒ to move around", "left");
    
    allLevels.push(level1);

    // call proceedToNextLevel() to actualize level 1's values 
    currentLvlNum = 0;
    proceedToNextLevel();
    

    // Set Up The Template of the Following Levels
    for (let i = 1; i < 9; i++) {
        const previousLevel = allLevels[i-1];

        // by default, the portal coordinates reflect where the last portal originally was
        const portalIsOnTheRightSide = previousLevel.portalCoord[0] > cnv.width/2;
        
        const portalCoordX = portalIsOnTheRightSide ? cnv.width/5 : cnv.width - cnv.width/5;
        const portalCoord = [portalCoordX, cnv.height/2];

        // levels 1-5 & 9 are grassy, levels 6-8 are rocky
        const terrain = (i+1 <= 5 || i+1 === 9) ? "grassy" : "rocky";

        // playerSpawn's default value is the players current coordinates
        const newLevel = new Level(i+1, terrain, [], portalCoord);
        allLevels.push(newLevel);
    }
    

    // LEVEL 2 (Tutorial for Gravity Swapping)
    const level2 = allLevels.find((level) => level.number === 2);
    level2.portalCoord = [300, 185];

    level2.addText(900, 250, 15, "Press W or ⇑ to swap gravity", "right");
    level2.addBlock(200, cnv.height-borderHeight-135, 200, 135, "tallGrass");


    // LEVEL 3
    const level3 = allLevels.find((level) => level.number === 3);
    
    level3.addBlock(940, 0, 50, cnv.height, "normal", 0, dirtColor); // border

    level3.addBlock(225, cnv.height-borderHeight-150/4, 150, 150/4, "shortGrass");
    level3.addBlock(225+150, cnv.height-borderHeight-80, 120, 80, "tallGrass");
    
    // floating flatform
    level3.addBlock(525, borderHeight+60, 100, 30, "shortGrass", Math.PI);
    level3.addBlock(525+35, borderHeight+20, 30, 40, "normal", 0, dirtColor);
    level3.addBlock(525+35+30, borderHeight+20, 350, 20, "normal", 0, dirtColor);

    level3.addBlock(500+100, 300, 150, 150/4, "shortGrass");
    level3.addBlock(500+150, 300+37, 50, 50, "normal", 0, dirtColor);
    level3.addBlock(500+150+50, 300+60, 240, 27, "normal", 0, dirtColor);


    // LEVEL 4 (First level with spikes)
    const level4 = allLevels.find((level) => level.number === 4);
    level4.portalCoord = [500 + 125, cnv.height/2-25];

    level4.addBlock(700, 0, 30, cnv.height, "normal", 0, dirtColor); // border
    
    level4.addSpike(900, cnv.height-borderHeight-25, 25, "normal", 0, lightGrassColor);

    level4.addBlock(100, cnv.height-borderHeight-100, 150, 100, "tallGrass");
    level4.addSpike(100, cnv.height-borderHeight-125, 25, "normal", 0, grassColor);

    level4.addBlock(260, borderHeight, 150, 100, "cloud");
    level4.addSpike(260, borderHeight+100, 20, "normal", Math.PI, cloudColor);

    for (let i = 0; i < 5; i++) {
        level4.addSpike(250+i*40, cnv.height-borderHeight-30, 40, "wide", 0, lightGrassColor);
    }
    for (let i = 0; i < 7; i++) {
        if (i < 2 || i > 4) level4.addSpike(410+i*40, borderHeight-15, 40, "wide", Math.PI, cloudColor);
    }
    
    level4.addBlock(450, cnv.height-borderHeight-100, 125, 100, "tallGrass");
    level4.addBlock(575, cnv.height-borderHeight-100, 125, 100, "tallGrass");
    level4.addSpike(510, cnv.height-borderHeight-125, 25, "normal", 0, grassColor);
    

    // LEVEL 5 (intro to cave section)
    const level5 = allLevels.find((level) => level.number === 5);
    level5.portalCoord = [level5.portalCoord[0] + 5, level5.portalCoord[1]];

    level5.addBlock(700, 0, 30, cnv.height, "normal", 0, rockColor); // border

    for (let i = 0; i < 5; i++) {
        level5.addBlock(300+i*75, borderHeight, 100, 75, "cloud");
        level5.addBlock(300+i*75, cnv.height-borderHeight-100, 100, 100, "tallGrass");
    }

    for (let i = 0; i < 3; i++) {
        level5.addSpike(365+i*125, borderHeight+65, 35, "wide", Math.PI, cloudColor2);
        level5.addSpike(300+i*125, cnv.height-borderHeight-126, 35, "wide", 0, grassColor);
    }

    for (let i = 0; i < 29; i++) {
        level5.addSpike(-5+i*35, borderHeight-10, 35, "wide", Math.PI, cloudColor2);
    }
    
    level5.addBlock(85, cnv.height-borderHeight-100, 140, 100, "tallGrass");

    level5.addBlock(0, cnv.height-borderHeight-25, 700, 25, "normal", 0, "rgb(133, 82, 39)");
    level5.addBlock(700, cnv.height-borderHeight-25, 300, 25, "normal", 0, rockColor);

    for (let i = 0; i < 9; i++) {
        level5.addSpike(-14+i*35, cnv.height-borderHeight-51, 35, "wide", 0, "rgb(133, 82, 39)");
        level5.addSpike(730+i*35, cnv.height-borderHeight-51, 35, "wide", 0, rockColor);
    }
    
    level5.addSpike(110, cnv.height-borderHeight-125, 25, "normal", 0, grassColor);

    // platforms connecting to the border
    level5.addBlock(730, borderHeight+20, 270, 30, "normal", 0, rockColor)
    level5.addBlock(0, borderHeight+20, 100, 30, "normal", 0, rockColor)
    level5.addBlock(70, borderHeight+50, 30, 20, "normal", 0, rockColor)

    // floating platforms
    level5.addBlock(0, borderHeight+70, 80, 35, "normal", 0, rockColor)
    level5.addBlock(-80, borderHeight+70, 80, 35, "normal", 0, rockColor)
    level5.addBlock(80, borderHeight+70, 80, 35, "normal", 0, rockColor)
    level5.addBlock(950, borderHeight+70, 120, 35, "normal", 0, rockColor)

    level5.addSpike(0, borderHeight+41, 35, "wide", Math.PI, rockColor);
    level5.addSpike(35, borderHeight+41, 35, "wide", Math.PI, rockColor);
    for (let i = 0; i < 8; i++) {
        level5.addSpike(730+i*35, borderHeight+41, 35, "wide", Math.PI, rockColor);
    }

    level5.addBlock(890, 285, 80, 60, "cloud");


    // LEVEL 6 (first cave level and first level with phase)
    const level6 = allLevels.find((level) => level.number === 6);
    level6.portalCoord = [120, level6.portalCoord[1]];

    for (let i = 0; i < 5; i++) { // spike border
        level6.addSpike(850+i*35, cnv.height-borderHeight-26, 35, "wide", 0, rockColor);
        level6.addSpike(850+i*35, borderHeight-9, 35, "wide", Math.PI, rockColor);
    }
    
    level6.addText(600, 175, 12.5, "Press S or ⇓ while midair to phase through transparent objects", "left");

    // beginning section //
    level6.addSpike(680, 370, 30, "normal", 0, rockColor);
    level6.addBlock(650, 250, 30, 150, "vert-rock", 0, rockColor);
    level6.addSpike(650, 228, 22, "normal", 0, rockColor);
    level6.addSpike(665, 235, 15, "normal", 0, rockColor);

    level6.addSpike(575, borderHeight, 30, "normal", Math.PI, rockColor);
    level6.addBlock(545, borderHeight, 30, 180, "vert-rock", 0, rockColor);
    level6.addSpike(545, 280, 10, "normal", Math.PI, rockColor);
    level6.addSpike(548, 280, 27, "normal", Math.PI, rockColor);

    level6.addBlock(575, 250, 75, 30, "phase", 0, phaseColor);
    level6.addSpike(445, 370, 30, "normal", 0, rockColor);

    level6.addBlock(370, 270, 75, 30, "horiz-rock", 0, rockColor);
    level6.addBlock(415, 175, 30, 225, "vert-rock", 0, rockColor);
    level6.addSpike(415, 165, 10, "normal", 0, rockColor);
    level6.addSpike(421, 157, 18, "normal", 0, rockColor);
    level6.addSpike(435, 165, 10, "normal", 0, rockColor);

    // middle section //
    // phase spikes
    level6.addBlock(445, 175, 100, 30, "phase", 0, "rgba(81, 79, 77, 0.7)");
    for (let i = 0; i < 3; i++) {
        level6.addSpike(445+i*(100/3), 150, 100/3, "phaseWide", 0, phaseColor);
        level6.addSpike(445+i*(100/3), 196.5, 100/3, "phaseWide", Math.PI, phaseColor);
    }
    
    level6.addBlock(250, 270, 75, 30, "horiz-rock");
    level6.addBlock(325, 270, 45, 30, "phase", 0, phaseColor);
    level6.addBlock(250, borderHeight, 30, 200, "vert-rock");

    // left top spikes
    level6.addSpike(280, 240, 30, "normal", 0, rockColor);
    level6.addSpike(300, 246, 24, "normal", 0, rockColor);
    
    // right top spikes
    level6.addSpike(397, 252, 18, "normal", 0, rockColor);
    level6.addSpike(380, 243, 27, "normal", 0, rockColor);
    level6.addSpike(370, 250, 20, "normal", 0, rockColor);

    // end section //
    // left bottom spikes
    level6.addSpike(250, 300, 24, "normal", Math.PI, rockColor);
    level6.addSpike(265, 300, 20, "normal", Math.PI, rockColor);
    level6.addSpike(273, 300, 28, "normal", Math.PI, rockColor);
    level6.addSpike(295, 300, 22, "normal", Math.PI, rockColor);
    level6.addSpike(313, 300, 12, "normal", Math.PI, rockColor);

    // right bottom spikes
    level6.addSpike(385, 300, 30, "normal", Math.PI, rockColor);
    level6.addSpike(370, 300, 25, "normal", Math.PI, rockColor);

    level6.addSpike(385, 370, 30, "normal", 0, rockColor);
    level6.addSpike(170, 370, 30, "normal", 0, rockColor);
    

    // LEVEL 7
    const level7 = allLevels.find((level) => level.number === 7);

    // center phase block
    level7.addBlock(0, 235, cnv.width, 30, "phase", 0, phaseColor);

    // start //
    // bottom spikes
    level7.addSpike(220, 340, 30, "normal", 0, rockColor);
    level7.addSpike(320, 265, 30, "normal", Math.PI, rockColor);
    level7.addSpike(320, 340, 30, "normal", 0, rockColor);

    // top spikes
    level7.addSpike(220, 130, 30, "normal", Math.PI, rockColor);
    level7.addSpike(220, 205, 30, "normal", 0, rockColor);
    level7.addSpike(320, 130, 30, "normal", Math.PI, rockColor);

    // middle //
    // top obstacles
    level7.addSpike(380, 205, 30, "normal", 0, rockColor);
    level7.addSpike(440, 130, 30, "normal", Math.PI, rockColor);
    level7.addSpike(480, 205, 30, "normal", 0, rockColor);
    level7.addSpike(520, 130, 30, "normal", Math.PI, rockColor);
    level7.addSpike(560, 205, 30, "normal", 0, rockColor);
    
    level7.addSpike(650, 205, 30, "phaseNormal", 0, phaseColor);
    level7.addSpike(720, 130, 30, "normal", Math.PI, rockColor);
    level7.addSpike(845, 130, 30, "normal", Math.PI, rockColor);
    

    // bottom obstacles
    level7.addSpike(380, 265, 30, "normal", Math.PI, rockColor);
    level7.addSpike(380, 340, 30, "normal", 0, rockColor);
    level7.addSpike(430, 265, 30, "phaseNormal", Math.PI, phaseColor);
    level7.addBlock(520, 320, 30, 170, "vert-rock");
    level7.addSpike(520, 297.5, 30, "wide", 0, rockColor);
    
    level7.addBlock(605, 265, 30, 50, "phase", 0, phaseColor);
    level7.addSpike(605, 307.5, 30, "wide", Math.PI, phaseColor);
    
    level7.addBlock(690, 320, 30, 170, "vert-rock");
    level7.addSpike(690, 290, 30, "normal", 0, rockColor);

    level7.addSpike(770, 340, 30, "normal", 0, rockColor);
    level7.addSpike(800, 340, 30, "normal", 0, rockColor);
    
    // phase spikes design
    for (let i = 0; i < 3; i++) {
        level7.addSpike(755+i*30, 205, 30, "phaseNormal", 0, phaseColor);
        level7.addSpike(755+i*30, 265, 30, "phaseNormal", Math.PI, phaseColor);
    }

    // left corners
    level7.addBlock(70, 30, 30, 150, "vert-rock"); // top left
    level7.addBlock(-50, 160, 150, 25, "horiz-rock"); // top left
    level7.addBlock(70, 320, 30, 150, "vert-rock"); // bottom left
    level7.addBlock(-50, 315, 150, 25, "horiz-rock"); // bottom left
    
    // right corners
    level7.addBlock(900, 30, 30, 150, "vert-rock"); // top right
    level7.addBlock(900, 160, 150, 25, "horiz-rock"); // top right
    level7.addBlock(900, 320, 30, 150, "vert-rock"); // bottom right
    level7.addBlock(900, 315, 150, 25, "horiz-rock"); // bottom right


    // border //
    for (let i = 0; i < 6; i++) {
        level7.addBlock(i*169, 100, 170, 30, "horiz-rock"); // top blocks
        level7.addBlock(30+i*169, 370, 170, 30, "horiz-rock"); // bottom blocks
    }

    // left border blocks
    level7.addBlock(0, borderHeight, 30, 170, "vert-rock");
    level7.addBlock(0, 269, 30, 170, "vert-rock");

    // right border blocks
    level7.addBlock(970, 70, 30, 170, "vert-rock");
    level7.addBlock(970, 230, 30, 170, "vert-rock");

    
    // LEVEL 8
    const level8 = allLevels.find((level) => level.number === 8);
    level8.portalCoord = [425, level8.portalCoord[1]];
    
    // borders around the portal
    // level8.addBlock(325, 155, 150, 150, "phase", 0, "rgba(0, 255, 0, 0.7)");
    
    level8.addBlock(412.5, 320, 30, 170, "vert-rock");
    level8.addBlock(340, 315, 170, 30, "horiz-rock");

    level8.addBlock(325, 155, 75, 20, "horiz-rock");
    level8.addBlock(400, 155, 50, 20, "phase", 0, phaseColor);
    level8.addBlock(450, 155, 75, 20, "horiz-rock");

    level8.addBlock(325, 155, 30, 190, "vert-rock");
    level8.addBlock(519, 140, 10, 50, "vert-rock");
    level8.addBlock(499, 155, 30, 190, "vert-rock");

    for (let i = 0; i < 6; i++) {
        const triSize = 14.5;
        level8.addSpike(325+i*triSize, 385.5, triSize, "normal", 0, rockColor);
        level8.addSpike(325+i*triSize, 345, triSize, "normal", Math.PI, rockColor);
        level8.addSpike(442.5+i*triSize, 385.5, triSize, "normal", 0, rockColor);
        level8.addSpike(442.5+i*triSize, 345, triSize, "normal", Math.PI, rockColor);
    }
    level8.addSpike(398.5, 357.5, 14.5, "normal", 3*Math.PI/2, rockColor);
    level8.addSpike(398.5, 372, 14.5, "normal", 3*Math.PI/2, rockColor);
    level8.addSpike(442, 357.5, 14.5, "normal", Math.PI/2, rockColor);
    level8.addSpike(442, 372, 14.5, "normal", Math.PI/2, rockColor);


    // spawn //
    level8.addBlock(570, 180, 90, 20, "horiz-rock");
    level8.addBlock(660, 180, 90, 20, "horiz-rock");
    level8.addBlock(660, 320, 90, 20, "horiz-rock");
    level8.addBlock(730, borderHeight, 20, 120, "vert-rock");
    level8.addBlock(730, borderHeight+120, 20, 120, "vert-rock");
    level8.addBlock(850, borderHeight, 20, 120, "vert-rock");
    level8.addBlock(850, borderHeight+120, 20, 120, "vert-rock");
    for (let i = 0; i < 5; i++) {
        level8.addSpike(750+i*20, borderHeight, 20, "normal", Math.PI, rockColor);
    }


    // left path start
    level8.addSpike(700, 380, 20, "normal", 0, rockColor);
    level8.addSpike(680, 380, 20, "normal", 0, rockColor);
    level8.addSpike(590, 380, 20, "normal", 0, rockColor);

    level8.addBlock(590, 250, 20, 120, "phase", 0, phaseColor);
    level8.addBlock(610, 250, 75, 20, "phase", 0, phaseColor);
    level8.addBlock(550, 320, 40, 20, "phase", 0, phaseColor);
    level8.addSpike(535, 320, 20, "phaseWide", 3*Math.PI/2, phaseColor);
    level8.addSpike(610, 270, 15, "phaseNormal", Math.PI, phaseColor);
    level8.addSpike(675, 270, 10, "phaseNormal", Math.PI, phaseColor);


    // left path middle
    level8.addSpike(723, 200, 7, "normal", Math.PI, rockColor);
    level8.addSpike(640, 200, 12, "normal", Math.PI, rockColor);
    level8.addSpike(628, 200, 12, "normal", Math.PI, rockColor);
    level8.addSpike(616, 200, 12, "normal", Math.PI, rockColor);
    level8.addSpike(570, 200, 10, "normal", Math.PI, rockColor);


    // left path end
    level8.addBlock(529, 180, 41, 20, "phase", 0, phaseColor);
    for (let i = 0; i < 4; i++) {
        level8.addBlock(519+i*43, 137.5, 43, 5, "horiz-rock");
    }
    level8.addSpike(450, borderHeight, 10, "normal", Math.PI, rockColor);


    // right path start
    level8.addSpike(897, 390, 10, "normal", 0, rockColor);
    level8.addSpike(850, 340, 10, "normal", Math.PI, rockColor);
    level8.addBlock(907, 280, 20, 120, "vert-rock");
    level8.addBlock(907, 160, 20, 120, "vert-rock");
    for (let i = 0; i < 3; i++) {
        level8.addBlock(870+i*120, borderHeight-10, 120, 20, "horiz-rock");
        level8.addBlock(907+i*120, 160, 120, 20, "horiz-rock");
        
        level8.addBlock(-250+i*120, borderHeight-10, 120, 20, "horiz-rock");
        level8.addBlock(-300+i*120, 160, 120, 20, "horiz-rock");
    }
    level8.addSpike(927.5, 105, 20, "wide", Math.PI, rockColor);
    level8.addSpike(982.5, 145, 20, "wide", 0, rockColor);
    level8.addSpike(0, 145, 20, "wide", 0, rockColor);

    level8.addBlock(108, borderHeight, 20, 120, "vert-rock");
    level8.addSpike(55, 160, 20, "wide", Math.PI/2, rockColor);


    // right path middle
    level8.addBlock(108, 220, 20, 120, "vert-rock");

    level8.addBlock(0, 230, 108, 20, "phase", 0, phaseColor);
    level8.addBlock(-108, 230, 108, 20, "phase", 0, phaseColor);
    level8.addBlock(927, 230, 100, 20, "phase", 0, phaseColor);
    level8.addBlock(1000, 230, 100, 20, "phase", 0, phaseColor);
    level8.addSpike(30, 220, 10, "phaseNormal", 0, phaseColor);
    level8.addSpike(970, 180, 10, "normal", Math.PI, rockColor);

    level8.addBlock(0, 300, 108, 20, "horiz-rock");
    level8.addBlock(-108, 300, 108, 20, "horiz-rock");
    level8.addBlock(927, 300, 43, 20, "phase", 0, phaseColor);
    level8.addBlock(970, 300, 108, 20, "horiz-rock");

    for (let i = 0; i < 9; i++) {
        level8.addSpike(-108+i*24, 282, 24, "wide", 0, rockColor);
    }
    for (let i = 0; i < 4; i++) {
        level8.addSpike(927+i*43/4, 289.3, 43/4, "phaseNormal", 0, phaseColor);
        level8.addSpike(927+i*43/4, 320, 43/4, "phaseNormal", Math.PI, phaseColor);
    }

    level8.addSpike(970, 282, 24, "wide", 0, rockColor);
    level8.addSpike(970+24, 282, 24, "wide", 0, rockColor);
    level8.addSpike(970+24*2, 282, 24, "wide", 0, rockColor);

    level8.addSpike(20, 382, 24, "wide", 0, rockColor);
    level8.addSpike(70, 314, 24, "wide", Math.PI, rockColor);
    level8.addSpike(107.5, 334.5, 21, "wide", Math.PI, rockColor);

    
    // right path end
    level8.addBlock(180, 280, 20, 120, "vert-rock");
    level8.addBlock(180, 280-120, 20, 120, "vert-rock");
    level8.addBlock(252, borderHeight, 20, 120, "vert-rock");
    level8.addBlock(252, borderHeight+120, 20, 120, "vert-rock");

    for (let i = 0; i < 10; i++) {
        level8.addSpike(162, 376-i*24, 24, "wide", 3*Math.PI/2, rockColor);
        level8.addSpike(194, 160+i*24, 24, "wide", Math.PI/2, rockColor);
    }
    level8.addSpike(190-7/2, borderHeight, 7, "normal", Math.PI, rockColor);

    level8.addSpike(252, 335, 20, "wide", Math.PI, rockColor);
    level8.addSpike(390, borderHeight, 10, "normal", Math.PI, rockColor);


    
    // LEVEL 9
    const level9 = allLevels.find((level) => level.number === 9);
    level9.portalCoord = [-500, -500]; // No Portal

    level9.addText(500, 250, 35, "Thanks for playing!", "center");
}

function checkObstacleCollisions() {
// drawObstacles(): loops through the current level's obstacles to check their collisions
    const currentLevel = allLevels.find((level) => level.number === currentLvlNum);
    
    for (let i in currentLevel.obstacles) {
        currentLevel.obstacles[i].checkCollisions();
    }
}

function respawnPlayer() {
// respawnPlayer(): resets the players coordinates to the start of the level
    const currentLevel = allLevels.find((level) => level.number === currentLvlNum);
    
    player.x = currentLevel.playerSpawn[0];
    player.y = currentLevel.playerSpawn[1];
    player.phasing = false;

    fallingDirection = "down";
    resetGravity();
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

    if (player.phasing) ctx.globalAlpha = 0.5;
    
    ctx.drawImage(document.getElementById("grey-ball"), -player.r * 1.5, -player.r * 1.5, player.r * 3, player.r * 3);

    ctx.globalAlpha = 1;

    ctx.restore();
}

function drawPortal() {
    // drawPlayer(): draws the portal and handles it's rotation

    // Black Portal
    ctx.globalAlpha = 0.75;
    ctx.save();
    ctx.translate(portal.x, portal.y)
    ctx.rotate(-portal.rotation);
    ctx.drawImage(document.getElementById("black-portal"), -portal.r * 2, -portal.r * 2, portal.r * 4, portal.r * 4);
    ctx.restore();


    // Blue Portal
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(portal.x, portal.y)
    ctx.rotate(portal.rotation);
    ctx.drawImage(document.getElementById("blue-portal"), -portal.r * 1.5, -portal.r * 1.5, portal.r * 3, portal.r * 3);
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
    
    // Grey Ball
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

    // checks if mouseInPlayBtn isn't undefined before setting the color properties
    if (mouseInPlayBtn !== undefined) {
        playBtn.bgColor = mouseInPlayBtn ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0)";
    }

    // Play Btn
    ctx.fillStyle = playBtn.bgColor;
    ctx.strokeStyle = playBtn.bgColor;
    ctx.lineWidth = 4;

    ctx.drawImage(document.getElementById("playbtn"), playBtn.x, playBtn.y, playBtn.w, playBtn.h);
    ctx.fillRect(playBtn.x, playBtn.y, playBtn.w, playBtn.h);
    ctx.strokeRect(playBtn.x, playBtn.y, playBtn.w, playBtn.h);

    // Credits
    ctx.fillStyle = "rgb(110, 110, 110)";
    ctx.font = "20px Outfit";
    ctx.textAlign = "center";
    ctx.fillText("This Took Forever", cnv.width/2, cnv.height/6-20);
    ctx.fillText("Credits to Gavin Diep For The Art", cnv.width/2, cnv.height/6);
}

function drawCursor() {
    // drawCursor(): draws a circle at the cursors coordinates
    
    // Cursor
    if (mouseX && mouseY) {
        mouseInPlayBtn = (
            mouseX > playBtn.x && mouseX < playBtn.x + playBtn.w &&
            mouseY > playBtn.y && mouseY < playBtn.y + playBtn.h
        )
        
        ctx.fillStyle = mouseInPlayBtn ? "rgb(171, 249, 255)" : "rgb(27, 240, 255)";
        drawCircle(mouseX, mouseY, 5);
    }
}
