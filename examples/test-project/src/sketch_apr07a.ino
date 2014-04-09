#include "hello.h"
#include "Cat.h"
#include "Dog.h"

Dog rosie;
Cat missy;

void setup() {
  // put your setup code here, to run once:
  
}

void loop() {
  // put your main code here, to run repeatedly:
  hello_world();
  missy.meow();
  rosie.bark();
}
