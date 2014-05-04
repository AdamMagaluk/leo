
#if (ARDUINO >= 100)
  #include <Arduino.h> // capital A so it is error prone on case-sensitive filesystems
#else
  #include <WProgram.h>
#endif

#include "Cat.h"

Cat::Cat(){

}

void Cat::meow(){
  digitalWrite(13, HIGH);
}
