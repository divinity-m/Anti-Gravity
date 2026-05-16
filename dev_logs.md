Starting Date: April 28, 2026

# Day 1 - Tuesday | In class work #
No functionality added yet, I started this midway through class so the goal for today has just been to set up the HTML and JS files, so thats all that I've done in class.

Things Added:
 - Fundamental code to make the website run



# Day 2 - Wednesday | In class work #
Got the full-screen canvas fully set up. For now the player's template is just a basic circle, I plan to replace it with a better design later. The movement has also been added, the "A", "D" and left/right arrow keys can be used to move the player left and right, while the "W" key and up arrow key inverts the gravity. I have an idea for what the "S" key and down arrow key should do, but it requires features that don't exist yet before it can be implemented.

Things Added:
 - Canvas
 - Player movement



# Day 3 - Thursday | In class work #
I refined some aspects of the game, such as making the gravity accelerate and making the player spin when it moves left and right. Gavin Diep helped me create a nice design for the player, it's inspired mostly by Geometry Dash's design for the default ball skin.

Things Added:
 - Player movement refinement
 - Player Design



# Day 4 - Friday | In class work #
I started working on the mechanics for the portal, which marks the checkpoint for the end of a level and warps the player into a new level. Gavin created a design for it. The portals functionality is still very incomplete, right now I'm just working on a 'gravitational pull' effect to suck the player into the portal when they get close enough.

Things Added:
 - Portal Design



# Day 7 - Monday | In class work #
Continued working on the gravity for the portal, it was initially very rigid and jarring, so I smoothened it out. This was done by finding the angle from the player to the portal, getting the difference in that angle and the angle the player is facing, gradually incrementing the players angle by portions of that difference, then incrementing the players coordinates based off that angle. The following code is a summarized rundown of my solution:
``` javascript
const portalDx = portal.x - player.x;
const portalDy = portal.y - player.y;

// the angle from the player to the portal
const angleToPortal = Math.atan2(portalDy, portalDx);

// gets the angular difference then normalizes it
let dAngle = angleToPortal - player.facingAngle;
dAngle = Math.atan2(Math.sin(dAngle), Math.cos(dAngle));

// get a turn speed proportional to the distance from the player to the portal
const turnSpeed = 0.1;

// add either the dAngle or the turnSpeed to the players angle
player.facingAngle += Math.sign(dAngle) * Math.min(Math.abs(dAngle), turnSpeed);

// player.facingAngle is recalculated outside of this section of the script

// increment the coordinates
player.x += Math.cos(player.facingAngle);
player.y += Math.sin(player.facingAngle);
```

Things Added:
 - Portal Gravity



# Day 8 - Tuesday | In class work #
Began shifting my focus away from player/portal design & funcitionality, and towards the games core concepts, which included the use of classes. I mostly worked on implementing levels and obstacles (both of which use classes), but took a slight detour to give the game a title screen. The play button on the title screen required me to add a `mousemove` and `click` event listener to the document to check for hover and click inputs. Because of all of these new goals, I wasn't able to complete anything specific this class.

Things Worked On:
 - `Level` class and `Block` class
 - Title Screen



# Day 9 - Wednesday | In class work #
Gavin created a lot of new designs for the game, such as a background, a grassy floor, and a cloudy roof. I finalized the title screen and got the play button working. I had issues detecting the cursors coordinates accurately for a while, I eventually found out that the problems stems from how the coordinates on the canvas differ from that of the clients screen, so to make them accurate, I needed to scale the cursors coordinates to match the canvas:
```javascript
function mouseMoveHandler(e) {
    const rect = cnv.getBoundingClientRect();
    
    // scale
    const scaleX = cnv.width / rect.width;
    const scaleY = cnv.height / rect.height;
    
    // save the coordinates in global variables
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleX * 1.05; // slightly increase mouseY due to slight differences which the scale fails to account for
}
```

Things Added:
 - Custom Background & Floor/Roof Design
 - Title Screen & Play Button



# Day 10 - Thursday | In class work #
I've done a lot of work on the levels. It took me a while to decide on where to place all of the code and I decided to put it all inside a function called `setUpLevels` rather than making a seprarate JS file for it. Inside the function, I've set up 10 level objects from the `Level` class, 9 of which were made inside a for-loop so they all have the same properties right now. Tommorrow, I'll make each level unique by giving them their obstacles. I plan to make level one void of obstacles and have a very simple guide on the games controls.

Things Added:
 - Levels (no obstacles yet)



# Day 11 - Friday | In class work & At home work #
I've been struggling to get the player collisions with obstacles working properly, specifically, the collisions that happens when the player comes into contact with the side of a block. These collisions cause the player to teleport to the top of the block instead of simply keeping it's x coordinate. I'm aware that this is due to how the conditions which check for collisions overlap one another.
``` javascript
const fallingUpIntoBlock = (
    player.y + player.r > this.y + this.h*0.5 && player.y - player.r + gravity < this.y + this.h &&
    player.x + player.r + player.speed > this.x && player.x - player.r - player.speed < this.x + this.w
);
// vs
const movingRightIntoBlock = (
    player.x + player.r + player.speed > this.x && player.x - player.r < this.x + this.w && // extremely similar conditions to the above variable
    player.y + player.r > this.y && player.y - player.r < this.y + this.h
);
```
  
  
**At Home Work**  
It took a while, but I found a solution to the collisions issue. I counteracted the overlapping values by expanding the range required for a sideways collisions to be detected.

```javascript
const movingRightIntoBlock = (
    player.x + player.r > this.x - player.speed*0.1 && player.x - player.r < this.x + this.w*0.25 &&
    player.y + player.r > this.y && player.y - player.r < this.y + this.h
);
```
Due to the `this.x - player.speed*0.1` the player doesn't need to directly go past the block's x coordinate for a collision to be detected. This creates some leeway in comparison to the collisions for falling up and down into the block, which are far stricter.

Things Added:
 - Obstacle Collisions



# Day 13 - Sunday | At home work #
I wanted to add a bit of a tutorial to the game for explaining the controls so I created a text class. I realized that there were some similarities between the `Text` and `Block` classes, and the obstacles I plan to add will likley have the same similarities, so I made an `Obstacle` class with properties and methods that every type of obstacle in the game should have. It's only a template so the class itself won't ever be used, just inherited.
Level one and two are pretty much complete, they don't have much content at all, but thats intentional because they only exist to explain the controls.

Things Added:
- `Obstacle` Class, `Text` Class, and Inheritance
- Level 1 and 2 + tutorial text



# Day 14 - Monday | In class work #
While working on level 3, I noticed that there were still many issues with the collisions for blocks, so I spent a lot of time on improving the conditions in the block class's `checkCollisions()` method. Gavin helped me design a gradient play button for the game as well.

Things Worked On:
 - Improved block collision detection
 - Some of level 3
 - Title screen design



# Day 15 - Tuesday | In class work  & At home work #
I completed level 3. I also updated the `Block` and `Text` by giving them a rotation property, allowing me to freely rotate them with a single parameter. 

**At Home Work**
I began working on a `Spike` class and created a `respawnPlayer()` function to account for deaths.

Things Added:
 - All of level 3 and small bits of level 4
 - Furthur improved on block collisions
 - rotation property for obstacle-related classes
 - Started developing spikes and created a `respawnPlayer()` function



# Day 16 - Wednesday | In class work #
I finished creating the `Spike` class while working on level 4, the first level to use spikes. Player death and respawning has also been fully accounted for.

Things Added:
 - All of level 4
 - Completed the `Spike` class



# Day 17 - Thursday | In class work #
I spent the entire class designing level 5 and I didn't encounter any issues/bugs while making it. I plan for level 6 and above to have a cave-like design, thankfully, gavin has already designed a backdrop for the cave, the platforms however are just going to be blank grey slates.

Things Added:
 - All of level 5



# Day 18 - Friday | In class work #
I started working on the players second ability, something I've been wanting to add since the beginning of the project. By pressing `S` or the down arrow key, the player can phase through certain blocks, this ability only reqiured a new `phasing` property for the player object along with two very small methods. I allowed for a `phase` variant for the `Block` class's `variant` property, this lets me identify which blocks can and cannot be phased through. Phase blocks will only be used in the cave-type levels.

Things Added:
 - Phasing ability
