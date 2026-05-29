# ANTI GRAVITY - CSE Project
A 2D platformer. You play as a ball with the unique ability to invert the direction of gravity. Using this skill, you can parkour through 8 levels with grassy and underground themes designed by my artistic best bud. This project was made with HTML, CSS, and Javascript and the overall concept takes a lot of inspiration from Geometry Dash, while the art used Kirby, and Mario as a canvas. My goal with Anti Gravity was to extract the ball gamemode from geometry dash and transform it into a separate platformer game using only my existing programming knowledge.

___

### Targets Landed:
- Player movement works as I intended and gravity's accelerating influence on the player functions better than I had hoped for.
- To an extent, I got a collision system which accounts for player speed, gravity, and multiple obstacles interacting with the player simultaneously. It took a very long time and multiple fixes to get the collisions to be more consitent, but I like the point it's reached.
- Although their hitboxes don't match their shape, the spikes are designed quite well and I perfer their rectangular hitbox because it's reminiscent of what Geometry Dash does with its spikes.
- I originally only planned for 5 levels with actual gameplay, and when I got to that goal I hoped to double it to 10. Despite not making it that far, I'm very satisfied with the 6 gameplay-focused levels (levels 1, 2, and 9 don't count) I've created, escpecially level 8. I chose quality over quantity, which is why I spent a lot of time making each level. I didn't only focus on designing either, any bugs would immedietly steal all of my attention and new ideas to improve on the level, such as rotating objects, would serve as healthy distractions. 

___

### Limitations:
- Hitboxes may still have flaws I don't know of. When widths and heights are pushed to the extremes, large or small, obstacles are bound to carry visibly conspicuous bugs. I haven't done enough extensive testing to find these bugs with the current version of my collision system, but I believe it's highly likely that they're there.
- Rotating obstacles doesn't rotate hitboxes, so I can only rotate an obstacle a full 180° to maintain a consistent hitbox, otherwise, the hitboxes would be highly innaccurate.

___

### What could I have done better?
Overall, I enjoyed the creation of this project, but there's a lot more I could have done to improve on it. For one, the animations are very lacking, besides the portal and the player rotating, the entire game is incredibly stiff. Animated cloud movements or dirt/rock pixels appearing on the ground when the player moves would have also been a beautiful touch to improve the user experience. \
I've already covered the hitboxes, but it's just painfully challenging to emphasize just how much difficulty I encountered when figuring out what boolean statements and if-statement chains would get things working properly, and even now, I'm very skepticle of if there are any undiscovered collision-related bugs sneaking through my code. I think my lack of confidence in my collision system stems mostly from how inexperience I am in coding collisions that dont immediately cause a dramatic event (eg. damage, respawn), but rather, force the player away from a specific area.

___

### Things to note
Gavin Diep made nearly all of the art. I think the only art he didnt make was the icons for the restart and home button, but those are just google stock images so I didn't make them either. The only art I designed would have been the buttons with text, which was inspired by Gavins original design for the play button. The main role I played when it came to the art was animating the spin of the player and the portal. \
I didn't play any role in the music besides coding it in. Thygan Buch made all of it. \
Unlike with my CSE project [Crescendo](https://divinity-m.github.io/Crescendo/), no AI was used in the making of this project.
