#include "hello.h"

#define LED_PIN 13


bool isOn = false;
void setup() {
  // put your setup code here, to run once:
  pinMode(13,OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  hello_world();

  if(isOn)
    digitalWrite(LED_PIN,LOW);
  else
    digitalWrite(LED_PIN,HIGH);

  delay(100);
}
