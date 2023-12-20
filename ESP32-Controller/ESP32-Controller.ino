/*
 *This code gets a json file from a webserver it then parses the data 
 *from the json file and uses it to control and LED strip inside of
 *a sculpture
 *
 *Eddie Farr 2023 
*/

//Defining the two tasks for multithreading 
TaskHandle_t Task1;
TaskHandle_t Task2;

#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>

//Wifi name and password
const char* ssid = ""; //your ssid goes here
const char* password = ""; //password for ssid goes here

//Your Domain name with URL path or IP address with path
const char* serverName = "https://theothering.glitch.me/lightdata.json";

// used for polling 
unsigned long lastTime = 0;
unsigned long timerDelay = 1000;

//get the current vote state and store it in an array
String sensorReadings;
int sensorReadingsArr[4];

//Assigning the pins for the RGB LED channels
uint8_t ledR = 5;
uint8_t ledG = 12;
uint8_t ledB = 13;

//Array 
uint8_t ledArray[3] = {1, 2, 3};

//initial brightness
int brightnessR = 0;
int brightnessG = 0;
//keep brightness within bounds
int clampedBrightnessG, clampedBrightnessR;
//should we be in the pulsing vote state
boolean shouldRun;
//rate we fade at
int fadeAmountR = 7;
int fadeAmountG = 7;
//used for timing
int pMillis, cMillis;

void setup() {
  //Start serial communication
  Serial.begin(115200);
  
  //seting up the pwm LED channels
  ledcSetup(1, 5000, 8);
  ledcSetup(2, 5000, 8);
  ledcSetup(3, 5000, 8);
  ledcAttachPin(ledR, 1);
  ledcAttachPin(ledG, 2);
  ledcAttachPin(ledB, 3);

  //initialize variable
  shouldRun = false;

  //Initialize the thread
  //Thread for controlling the lights
  xTaskCreatePinnedToCore(
    Task1code,
    "Task1",
    30000,
    NULL,
    0,
    &Task1,
    0);

  delay(500);

  //Thread for collecting data from the webserver 
  xTaskCreatePinnedToCore(
    Task2code,
    "Task2",
    20000,
    NULL,
    1,
    &Task2,
    1);

  delay(500);

  //Log onto the WIFI 
  WiFi.begin(ssid, password);
  Serial.println("Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());

  Serial.println("Timer set to 5 seconds (timerDelay variable), it will take 5 seconds before publishing the first reading.");

}
//update leds based on web service
void Task1code( void * pvParameters ) {
  
  Serial.println(uxTaskGetStackHighWaterMark(NULL));

  for (;;) {
    //which light should we turn on
    whichLight();
    //are we in the voting state
    if (shouldRun) {
      pulse();
    }
  }
  
}

//Task2code: blinks an LED every 700 ms
void Task2code( void * pvParameters ) {
  Serial.println(uxTaskGetStackHighWaterMark(NULL));

  for (;;) {
    // check to see if we have any updates from the webserver
    checkForUpdates();
  }
  
}

//web stuff
String httpGETRequest(const char* serverName) {
  // WiFiClient client;
  HTTPClient http;

  // Your Domain name with URL path or IP address with path
  http.begin(serverName);

  // Send HTTP GET request
  int httpResponseCode = http.GET();

  String payload = "{}";

  if (httpResponseCode > 0) {
    payload = http.getString();
  }
  else {
  }
  // Free resources
  http.end();

  return payload;
}

//function that checks to see if the lightdata.json file has been updated
void checkForUpdates() {
  if ((millis() - lastTime) > timerDelay) {
    //Check WiFi connection status
    if (WiFi.status() == WL_CONNECTED) {

      sensorReadings = httpGETRequest(serverName);
      JSONVar myObject = JSON.parse(sensorReadings);

      // JSON.typeof(jsonVar) can be used to get the type of the var
      if (JSON.typeof(myObject) == "undefined") {
        Serial.println("Parsing input failed!");
        return;
      }

      // myObject.keys() can be used to get an array of all the keys in the object
      JSONVar keys = myObject.keys();

      for (int i = 0; i < keys.length(); i++) {
        JSONVar value = myObject[keys[i]];
        sensorReadingsArr[i] = int(value);
      }
    }
    else {
      Serial.println("WiFi Disconnected");
    }

    //debug to see what information we are getting
    Serial.println(sensorReadingsArr[0]);
    Serial.println(sensorReadingsArr[1]);
    Serial.println(sensorReadingsArr[2]);
    Serial.println(sensorReadingsArr[3]);

    lastTime = millis();
  }
}

//light stuff
void whichLight() {
  //choice one
  if (sensorReadingsArr[0] == 1 && shouldRun == false) {
    blueLight();
  }
  //choice 2
  if (sensorReadingsArr[1] == 1 && shouldRun == false) {
    orangeLight();
  }
  //vote
  if (sensorReadingsArr[2] == 1) {
    shouldRun = true;
  }
  //tie
  if (sensorReadingsArr[3] == 1 && shouldRun == false) {
    tie();
  }
  //turn the light off
  if (sensorReadingsArr[0] == 0 && sensorReadingsArr[1] == 0 && sensorReadingsArr[2] == 0 && sensorReadingsArr[3] == 0 && shouldRun == false) {
    off();
  }
}

void blueLight() {
  ledcWrite(1, 0);
  ledcWrite(2, 0);
  ledcWrite(3, 255);
}

void orangeLight() {
  ledcWrite(1, 255);
  ledcWrite(2, 41); //20  & 41 looked good
  ledcWrite(3, 0);
}

void tie() {
  ledcWrite(1, 255);
  ledcWrite(2, 255);
  ledcWrite(3, 0);
}

void ledcAnalogWrite(uint8_t channel, uint32_t value, uint32_t valueMax = 255) {
  // calculate duty, 4095 from 2 ^ 12 - 1
  uint32_t duty = (255 / valueMax) * min(value, valueMax);

  // write duty to LEDC
  ledcWrite(channel, duty);
}

void pulse() {
  cMillis = millis();

  if (cMillis - pMillis > 30) {
    pMillis = cMillis;

    ledcAnalogWrite(1, clampedBrightnessR);
    ledcWrite(2, 0);
    ledcAnalogWrite(3, clampedBrightnessG);

    // change the brightness for next time through the loop:
    brightnessR = brightnessR + fadeAmountR;
    brightnessG = brightnessG + fadeAmountG;
    clampedBrightnessR = map(brightnessR, 0, 255, 0, 165);
    clampedBrightnessG = map(brightnessG, 0, 255, 0, 165);

    // reverse the direction of the fading at the ends of the fade:
    if (brightnessR <= 0 || brightnessR >= 255) {
      fadeAmountR = -fadeAmountR;
    }

    if (brightnessG <= 0 || brightnessG >= 255) {
      fadeAmountG = -fadeAmountG;
    }
    if (brightnessR <= 0 && brightnessG <= 0) {
      shouldRun = false;
    }
  }
}

void off() {
  ledcWrite(1, 0);
  ledcWrite(2, 0);
  ledcWrite(3, 0);
  shouldRun = false;
}

void loop() {

}
