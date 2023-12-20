// init project
var express = require("express");
var app = express();
var server = app.listen(process.env.PORT);
//socket io server
var io = require("socket.io")(server);

//votes
let choiceOneTotal = 0,
  choiceTwoTotal = 0,
  totalVotes = 0;

let lightData, lightDataJson;

let fs = require("fs");

//questions state
let state = 0;

//timer
let timeLeft = 0;
let timerId;

console.log("server running");

app.use(express.static("public"));

//view for participants
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

//where esp32 will connect too
app.get("/lightstate", function (request, response) {
  response.sendFile(__dirname + "/views/lightstate.html");
});

//where leader control panel is
app.get("/control", function (request, response) {
  response.sendFile(__dirname + "/views/controlPanel.html");
});

//handle client server interactions
io.on("connection", newConnection);

function newConnection(socket) {
  console.log("a user connected " + socket.id);

  //controller event
  socket.on("reset", resetValues);

  socket.on("vote", updateState);

  //blink light to signal vote
  socket.on("pulse", pulseLight);

  //all off
  socket.on("off", turnLightsOff);

  //controller sets new state push to everyone connected
  function updateState(data) {
    state = data.state;
    if (state == 0) {
      io.emit("updateText", {
        n: 0,
        q: "</br></br>Welcome to The Othering interactive performance! </br></br> Throughout the performance you will be asked to vote on what the performers will do next. When the light on stage begins to flash a question will appear on this webpage. Please keep this page open to make voting easier. </br></br> Thank you for coming today and being a part of the work. </br></br> We hope you enjoy your evening!",
        a: "",
        b: "",
      });
    }
    if (state == 1) {
      pulseLight();
      timeLeft = 30;
      timerId = setInterval(countdown, 1000);
      io.emit("updateText", {
        n: 1,
        q: "Should Children Talk to the Woman or get her attention Chasing her?",
        a: "Talk",
        b: "Chase",
      });
    }
    if (state == 2) {
      pulseLight();
      timeLeft = 30;
      timerId = setInterval(countdown, 1000);
      io.emit("updateText", {
        n: 2,
        q: "Should they dance Ohad Naharin or Burlesque next?",
        a: "Ohad Naharin",
        b: "Burlesque",
      });
    }
    if (state == 3) {
      pulseLight();
      timeLeft = 30;
      timerId = setInterval(countdown, 1000);
      io.emit("updateText", {
        n: 3,
        q: "Should she choose Sarah or Brian?",
        a: "Sarah",
        b: "Brian",
      });
    }
    if (state == 4) {
      pulseLight();
      timeLeft = 30;
      timerId = setInterval(countdown, 1000);
      io.emit("updateText", {
        n: 4,
        q: "Should Children Listen to the Woman or Disturb her?",
        a: "Listen",
        b: "Disturb",
      });
    }
    if (state == 5) {
      pulseLight();
      timeLeft = 30;
      timerId = setInterval(countdown, 1000);
      io.emit("updateText", {
        n: 5,
        q: "Should they Leave or Save the Woman?",
        a: "Leave",
        b: "Save",
      });
    }
    resetValues();
  }

  //if you load the page send the current state
  if (state == 0) {
    socket.emit("updateText", {
      n: 0,
      q: "</br></br>Welcome to The Othering interactive performance! </br></br> Throughout the performance you will be asked to vote on what the performers will do next. When the light on stage begins to flash a question will appear on this webpage. Please keep this page open to make voting easier. </br></br> Thank you for coming today and being a part of the work. </br></br> We hope you enjoy your evening!",
      a: "",
      b: "",
    });
  }

  if (state == 1) {
    socket.emit("updateText", {
      n: 1,
      q: "Should Children Talk to the Woman or get her attention Chasing her?",
      a: "Talk",
      b: "Chase",
    });
  }
  if (state == 2) {
    socket.emit("updateText", {
      n: 2,
      q: "Should they dance Ohad Naharin or Burlesque next?",
      a: "Ohad Naharin",
      b: "Burlesque",
    });
  }
  if (state == 3) {
    socket.emit("updateText", {
      n: 3,
      q: "Should she choose Sarah or Brian?",
      a: "Sarah",
      b: "Brian",
    });
  }
  if (state == 4) {
    socket.emit("updateText", {
      n: 4,
      q: "Should Children Listen to the Woman or Disturb her?",
      a: "Listen",
      b: "Disturb",
    });
  }
  if (state == 5) {
    socket.emit("updateText", {
      n: 5,
      q: "Should they Leave or Save the Woman?",
      a: "Leave",
      b: "Save",
    });
  }

  //controler functions
  //reset the poll and turn off the pulsing light
  function resetValues() {
    //set values back to zero
    choiceOneTotal = 0;
    choiceTwoTotal = 0;
    //push to client to reset their screens
    io.emit("updatePie", {
      choiceOne: choiceOneTotal,
      choiceTwo: choiceTwoTotal,
    });
  }

  function turnLightsOff() {
    lightData = { b: 0, o: 0, v: 0, t: 0 };
    lightDataJson = JSON.stringify(lightData);
    writeData();
    readData(); // for debugging
  }

  //client events
  socket.on("choice_one", choiceOne);
  socket.on("choice_two", choiceTwo);

  //when someone joins send data to them
  socket.emit("updatePie", {
    choiceOne: choiceOneTotal,
    choiceTwo: choiceTwoTotal,
  });

  function choiceOne(data) {
    if (data.choiceOne == 1) {
      choiceOneTotal += 1;
      io.emit("updatePie", {
        choiceOne: choiceOneTotal,
        choiceTwo: choiceTwoTotal,
      });
    }
  }

  function choiceTwo(data) {
    if (data.choiceTwo == 2) {
      choiceTwoTotal += 1;
      io.emit("updatePie", {
        choiceOne: choiceOneTotal,
        choiceTwo: choiceTwoTotal,
      });
    }
  }

  function countdown() {
    io.emit("timer", {
      time: timeLeft,
    });
    if (timeLeft <= 0) {
      clearTimeout(timerId);
      if (choiceOneTotal > choiceTwoTotal) {
        lightData = { b: 1, o: 0, v: 0, t: 0 };
        lightDataJson = JSON.stringify(lightData);
        writeData();
        //readData(); // for debugging
      } else if (choiceOneTotal < choiceTwoTotal) {
        lightData = { b: 0, o: 1, v: 0, t: 0 };
        lightDataJson = JSON.stringify(lightData);
        writeData();
        //readData(); // for debugging
      } else if (choiceOneTotal === choiceTwoTotal) {
        lightData = { b: 0, o: 0, v: 0, t: 1 };
        lightDataJson = JSON.stringify(lightData);
        writeData();
        //readData(); // for debugging
      }
    } else {
      timeLeft--;
    }
  }

  function pulseLight() {
    lightData = { b: 0, o: 0, v: 1, t: 0 };
    lightDataJson = JSON.stringify(lightData);
    writeData();
    // readData();
  }
}

//function to check data for debugging
function readData() {
  let lightData = fs.readFile(
    __dirname + "/public/lightdata.json",
    (err, data) => {
      if (err) throw err;
      console.log(JSON.parse(data));
    }
  );
}

//writes the light state as a json file for the esp32 to grab and use
function writeData() {
  let lightData = fs.writeFile(
    __dirname + "/public/lightdata.json",
    lightDataJson,
    (err) => {
      if (err) {
        console.log("an error has occured", err);
        return;
      }
    }
  );
}
