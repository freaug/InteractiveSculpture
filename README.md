# InteractiveSculpture
A web app that uses socketio, nodejs, and express to allow people to vote in real-time to determine what dance performers will do.

This was a project for <a href="https://www.instagram.com/bautanzt_here/" target="_blank">Bautanzt Here</a>. Audience members were asked to vote through the web app at certain points during the performance.  The results of the vote would change the color of LEDs in a sculpture on stage, which would dictate what the performers would do next.

This all happened in real-time.  The app was originally hosted on <a href="https://glitch.com/" target="_blank">Glitch.com</a>. Glitch is helpful for hosting full-stack applications although it has limited scalability, so I wouldn't use it for anything outside a small experience like this. We had a maximum of about 50 users at once time on the app.

The web app has two pages that can be accessed 

The <i><b>control</b></i> view allows you to set the <i><b>user</b></i> view as well as setting the sculpture to "vote" mode (slowly pulsing purple) and to turn the lights off.  

The <i><b>user</b></i> view shows the current question and the option to pick one of two choices, once a choice is selected a pie chart showing the breakdown of votes is generated. 

The results of the vote generate a JSON file that contains data to control the light.

The sculpture has an ESP32 microcontroller connected to a <a href="https://github.com/zumdar/16_channel_pwm_esp32" target="_blank">custom LED control board</a> (created by my friend) that polls the webserver for the JSON file and then updates the lights accordingly.

There are a few features I wasn't able to implement such as user persistence.  That's on the todo if this project ever receives more funding. Currently, you can refresh the page and vote again but that wouldn't be too hard to fix.  
