#include <SoftwareSerial.h>
#include "WHILL.h"

SoftwareSerial ss(7,6);  // TX pin 7, RX pin 6
WHILL whill(&ss);

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);

  whill.begin(200);
  whill.refresh();
  whill.setJoystick(0,0);     // Stop
}

void loop() {

  static String inputString = ""; // 入力文字列を格納する変数
  static boolean stringComplete = false; // 文字列の受信が完了したかどうかを示すフラグ

  // シリアルデータが受信された場合の処理
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    inputString += inChar;
    if (inChar == '\n') {
      stringComplete = true;
    }
  }

  // 文字列の受信が完了した場合の処理
  if (stringComplete) {
    int commaIndex = inputString.indexOf(',');
    if (commaIndex != -1) {
      String xString = inputString.substring(0, commaIndex);
      String yString = inputString.substring(commaIndex + 1, inputString.length() - 1); // \nを除く

      int x = xString.toInt();
      int y = yString.toInt();

      Serial.print("X: ");
      Serial.println(x);
      Serial.print("Y: ");
      Serial.println(y);

      whill.setJoystick(x, y);
    }

    // 変数をリセット
    inputString = "";
    stringComplete = false;
  }
}