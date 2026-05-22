# ANTI GRAVITY - CSE Project
A 2D platformer. You play as a ball with the unique ability to invert the direction of gravity. Using this skill, you can parkour through 8 levels with grassy and underground themes designed by my artistic best bud. This project was made with HTML, CSS, and Javascript and the overall concept takes a lot of inspiration from Geometry Dash, while the art used Kirby, and Mario as a canvas. My goal with Anti Gravity was to extract the ball gamemode from geometry dash and transform it into a separate platformer game using only my existing programming knowledge.

### Limitations:
- Hitboxes are inherently flawed in their structure. When widths and heights are pushed to the extremes, large or small, obstacles are bound to carry visibly conspicuous bugs. I haven't done enough extensive testing to find these bugs with the current version of my collision system, but I believe it's highly likely that they're there.
- Rotating obstacles doesn't rotate hitboxes, so I can only rotate an obstacle a full 180° to maintain a consistent hitbox, otherwise, the hitboxes would be highly innaccurate.
