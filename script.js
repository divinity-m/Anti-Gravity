/// SCRIPT.JS ANTI GRAVITY ///
const cnv = document.getElementById("game-canvas");
const ctx = cnv.getContext("2d");

x = 0
dx = 1

funciton draw() {
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  
  ctx.fillStyle = "black";
  ctx.fillRect(10, 10, x, cnv.height/2);

  if (x < 0) dx = 1
  if (x > cnv.width) dx = -1
  x++;
  
  requestAnimationFrame(draw);
}
draw()
