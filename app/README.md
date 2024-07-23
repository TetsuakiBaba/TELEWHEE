# TELEWHEE
This repository provides a simple template that is useful for developing video, audio, and data communication applications using WebRTC.

## Getting Started on your local machine
1. git clone https://github.com/TetsuakiBaba/WebRTC_Simple_Template.git
2. npm install
3. node main.js
4. Open a browser and access http://localhost:3000
5. Open a serial port on the PC of WHILL.

### WHILL Setup
1. Prepare a WHILL Model CR.
2. Prepare an arduino board and [whill-sdk-arduino library](https://github.com/WHILL/whill-sdk-arduino).
3. Program the arduino board with the sketch in the `arduino/whill_controller/` directory.
4. Connect the arduino board to the WHILL Model CR.

## Deploy
Deploy to anywhere you like. For example, Heroku, Render, Vercel, etc.
