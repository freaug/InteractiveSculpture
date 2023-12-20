let reset, vote, off, v0, v1, v2, v3, v4, v5;

let socket = io();

function setup() {
  widthM = displayWidth * displayDensity();
  heightM = displayHeight * displayDensity();

  createCanvas(400, 10);

  reset = createButton("reset");
  reset.id("control-button");
  reset.position(10, height + 50);
  reset.mousePressed(resetVotes);

  vote = createButton("pulse");
  vote.id("control-button");
  vote.position(200, height + 50);
  vote.mousePressed(pulse);

  off = createButton("turn off");
  off.id("control-button");
  off.position(400, height + 50);
  off.mousePressed(offF);
  
  v0 = createButton("Home Page");
  v0.id("control-button");
  v0.position(600, height + 50);
  v0.mousePressed(v0f);

  v1 = createButton("vote one");
  v1.id("control-button");
  v1.position(10, height + 150);
  v1.mousePressed(v1f);

  v2 = createButton("vote two");
  v2.id("control-button");
  v2.position(200, height + 150);
  v2.mousePressed(v2f);

  v3 = createButton("vote three");
  v3.id("control-button");
  v3.position(400, height + 150);
  v3.mousePressed(v3f);

  v4 = createButton("vote four");
  v4.id("control-button");
  v4.position(600, height + 150);
  v4.mousePressed(v4f);

  v5 = createButton("vote five");
  v5.id("control-button");
  v5.position(800, height + 150);
  v5.mousePressed(v5f);

  noLoop();
}

function draw() {
  background(220);
}

function resetVotes() {
  socket.emit("reset");
  redraw();
}

function v0f(){
  socket.emit("vote",{
    state: 0,
  });
  redraw();
}

function v1f() {
  socket.emit("vote", {
    state: 1,
  });
  redraw();
}

function v2f() {
  socket.emit("vote", {
    state: 2,
  });
  redraw();
}

function v3f() {
  socket.emit("vote", {
    state: 3,
  });
  redraw();
}

function v4f() {
  socket.emit("vote", {
    state: 4,
  });
  redraw();
}

function v5f(){
  socket.emit("vote",{
    state: 5
  });
  redraw();
}

function pulse() {
  socket.emit("pulse");
  redraw();
}

function offF() {
  socket.emit("off");
  redraw();
}
