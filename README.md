# ANTI GRAVITY - CSE Project
A 2D platformer. You play as a ball with the unique ability to invert the direction of gravity. Using this skill, you can parkour through 8 levels with grassy and underground themes designed by my artistic best bud. This project was made with HTML, CSS, and Javascript and the overall concept takes a lot of inspiration from Geometry Dash, while the art used Kirby, and Mario as a canvas. My goal with Anti Gravity was to extract the ball gamemode from geometry dash and transform it into a separate platformer game using only my existing programming knowledge.

### Targets Landed:
- Player movement works as I intended and gravity's accelerating influence on the player functions better than I had hoped for.
- To an extent, I got a collision system which accounts for player speed, gravity, and multiple obstacles interacting with the player simultaneously.
- Spikes are designed well, but their hitboxes don't match their shape. I also would perfer a more animated respawn.

### Limitations:
- Hitboxes are inherently flawed in their structure. When widths and heights are pushed to the extremes, large or small, obstacles are bound to carry visibly conspicuous bugs. I haven't done enough extensive testing to find these bugs with the current version of my collision system, but I believe it's highly likely that they're there.
- Rotating obstacles doesn't rotate hitboxes, so I can only rotate an obstacle a full 180° to maintain a consistent hitbox, otherwise, the hitboxes would be highly innaccurate.


Overall, I enjoyed the creation of this project, but there's a lot more I could have done to improve on it. For one, the animations are very lacking, besides the portal and the player rotating, the entire game is incredibly stiff. Animated cloud movements or dirt/rock pixels appearing on the ground when the player moves would have been a beautiful touch to improve the games design.
I've already covered the hitboxes, but it's just painfully challenging to emphasize just how much difficulty I had figuring out what boolean statements and if-statement chains would get things working the way I wanted, and even now, I'm very skepticle of if there are any undiscovered collision-related bugs sneaking through my code right now. I think my lack of confidence in my collision system stems mostly from how inexperience I am in coding collisions that dont immediately cause a dramatic event (eg. damage, respawn), but rather, force the player away from a specific area.
