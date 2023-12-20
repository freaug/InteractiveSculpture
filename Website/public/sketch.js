let choice_one, //button
  choice_two, //button
  response, //p element
  prompt, //p element
  spacer, //p element
  cnv, //canvas
  choice_one_text, //inner html button
  choice_two_text, //inner html button
  prompt_text, //inner html prompt
  page_title, //header for page
  canvas_holder, //div to position the canvas
  timer, //where timer lives after vote starts
  title; //let people know what question we on

let widthM, heightM;

let textSizeF, heightOffset;

let choiceVal; //button text

let questionNumber;
let timeLeftF = "";

let socket = io();

let [total, choiceOne, choiceTwo] = [0, 0, 0];

function setup() {
  //get width and height for device
  widthM = displayWidth * displayDensity();
  heightM = displayHeight * displayDensity();
  //console.log(widthM);
  if (widthM < 1000) {
    textSizeF = 32;
    heightOffset = 50;
  } else if (widthM > 1001 && widthM < 1200) {
    textSizeF = 48;
    heightOffset = 75;
  } else {
    textSizeF = 64;
    heightOffset = 100;
  }
  //console.log(textSizeF);

  //pie time
  angleMode(DEGREES);

  //calculate pie slices
  socket.on("updatePie", processData);

  //update the text
  socket.on("updateText", updateText);

  //update timer
  socket.on("timer", timerF);

  //set font
  textFont("monospace");

  title = select("#title");

  spacer = createP();

  //question to vote on
  prompt = createP(" ");
  prompt.id("prompt");
  prompt.size(widthM * 0.95);
  prompt.parent("prompt_holder");

  //space between canvas and buttons
  spacer = createP();

  timer = createP("Time Left To Vote " + timeLeftF);
  timer.id("timer");
  timer.size(widthM * 0.95);
  timer.parent("timer_holder");
  //select('#timer_holder').show();

  //choice one button
  choice_one = createButton(" ");
  choice_one.id("l");
  choice_one.size(widthM * 0.95);
  choice_one.mousePressed(submit_one);

  //space between buttons
  spacer = createP();

  //choice two button
  choice_two = createButton(" ");
  choice_two.id("r");
  choice_two.size(widthM * 0.95);
  choice_two.mousePressed(submit_two);

  //indication a button has been pressed
  response = createP("");
  response.id("thank");
  response.size(widthM * 0.95);
  response.hide();

  //spacer between buttons and questions prompt
  spacer = createP();

  //canvas
  cnv = createCanvas(widthM, heightM * 0.5);
  cnv.parent("canvas_holder");
  select("#canvas_holder").hide();

  //don't redraw the canvas
  noLoop();
}

function draw() {
  background(0);

  if (total <= 0) {
  } else {
    pieChart(widthM * 0.5, heightM * 0.25);
  }
  console.log(timeLeftF);
}

function emptyPie() {
  //text
  fill("white");
  textSize(textSizeF);
  textAlign(LEFT, TOP);
  text("Vote Results Will Appear Below", 80, 0);
  //circle where chart goes
  push();
  noFill();
  stroke(255);
  strokeWeight(4);
  ellipse(widthM * 0.5, heightM * 0.25, heightM * 0.4, heightM * 0.4);
  pop();
}

//process sent data
function processData(data) {
  choiceOne = data.choiceOne;
  choiceTwo = data.choiceTwo;
  total = choiceOne + choiceTwo;
  redraw();
}

//updates data to display
function updateText(data) {
  //get data
  questionNumber = data.n;

  if (questionNumber == 0) {
    choice_one.hide();
    choice_two.hide();
    title.hide();
    timer.hide();
    prompt_text = data.q;
    prompt.html(prompt_text);
    prompt.show();
    response.hide();
  } else {
    //default page view
    select("#title").html("Question " + questionNumber);

    prompt_text = data.q;
    choice_one_text = data.a;
    choice_two_text = data.b;

    //update the text on screen
    choice_one.html(choice_one_text);
    choice_two.html(choice_two_text);
    prompt.html(prompt_text);

    resetPage();
  }
  //redraw the screen
  redraw();
}

function timerF(data) {
  timeLeftF = data.time;
  timer.html("Time Left To Vote " + timeLeftF);
  redraw();
}

//send data
function submit_one() {
  let data = {
    choiceOne: 1,
  };
  socket.emit("choice_one", data);
  choiceVal = choice_one_text + ".";
  thanksForSubmitting(choiceVal);
}

function submit_two() {
  let data = {
    choiceTwo: 2,
  };
  socket.emit("choice_two", data);
  choiceVal = choice_two_text + "."; //make text color of choice
  thanksForSubmitting(choiceVal);
}

function resetPage() {
  //reset page
  select("#canvas_holder").hide();
  choice_one.show();
  choice_two.show();
  timer.show();
  title.show();
  prompt.show();
  response.hide();
}

function noMoreButtons() {
  choice_one.hide();
  choice_two.hide();
  timer.hide();
  select("#canvas_holder").hide();

  response.show();
  response.html("Time is up.  A new question will appear soon.");
}

function thanksForSubmitting(input) {
  //hide buttons and prompt
  choice_one.hide();
  choice_two.hide();

  //show thank you text
  response.show();
  select("#canvas_holder").show();
  //add text to response
  response.html(
    "Thank you. You have chosen " +
      input +
      " Please keep this webpage open to continue voting." +
      " When the light on stage begins to flash a new prompt" +
      " will appear."
  );
}
//draw the pie chart and text
function pieChart(x, y) {
  let startVal = 0;
  let range = 0;

  //results text
  push();
  fill("white");
  textSize(textSizeF);
  textAlign(LEFT, TOP);
  text("Results", 80, 10);
  pop();

  push();
  fill("white");
  textSize(textSizeF);
  textAlign(RIGHT);
  text(choiceOne, 100, height - heightOffset);
  textAlign(LEFT);
  text(choice_one_text, 120, height - heightOffset);
  pop();

  push();
  fill("white");
  textSize(textSizeF);
  textAlign(LEFT);
  text(choiceTwo, width - 164, height - heightOffset);
  textAlign(RIGHT);
  text(choice_two_text, width - 184, height - heightOffset);
  pop();

  //orange slice
  range = choiceTwo / total;
  drawSlice("orange", x, y, heightM * 0.4, startVal, startVal + range);
  startVal += range;

  //blue slice
  range = choiceOne / total;
  drawSlice("blue", x, y, heightM * 0.4, startVal, startVal + range);
  startVal += range;
}

//function to draw slice
function drawSlice(fColor, x, y, d, percent1, percent2) {
  fill(fColor);
  stroke(255);
  strokeWeight(4);
  arc(x, y, d, d, -90 + percent1 * 360, -90 + percent2 * 360);
}
