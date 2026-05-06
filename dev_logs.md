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
Continued working on the gravity for the portal, it was initially very rigid and jarring, so I smoothened it out by gradually incrementing the players angle, then modifying the players coordinates based off that angle like so:
``` javascript
player.x += Math.cos(player.facingAngle);
player.y += Math.sin(player.facingAngle);
```

Things Added:
 - Portal Gravity



# Day 8 - Tuesday | In class work #
Began shifting my focus away from player/portal design & funcitionality, and towards the games core concepts, which included the use of classes. I mostly worked on implementing levels and obstacles (both of which use classes), but took a slight detour to give the game a title screen. The play button on the title screen required me to add a `mousemove` and `click` event listener to the document to check for hover and click inputs. Because of all of these new goals, I wasn't able to complete anything specific this class.


Things Worked On:
 - Levels & Obstacles
 - Start Screen
