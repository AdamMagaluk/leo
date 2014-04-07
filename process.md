### 1. Create Build dir
### 2. Compile sketches main file with "Arduino.h" from /ROOT/hardware/arduino/avr/cores/arduino

```
#line 1 "sketch_apr06a.ino"
#include "Arduino.h"
void setup();
void loop();
#line 1
```

### 3 All c and cpp files included recursivly from /ROOT/hardware/arduino/avr/cores/arduino

CC=/ROOT/Java/hardware/tools/avr/bin/avr-gcc

CFLAGS=-c -g -Os -w -ffunction-sections -fdata-sections -MMD

BOARD_FLAGS=-mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=155 -DARDUINO_AVR_YUN -DARDUINO_ARCH_AVR -DUSB_VID=8041 -DUSB_PID=0x8041 -DUSB_MANUFACTURER= -DUSB_PRODUCT="Arduino Yun"

INCLUDES=-I/ROOT/hardware/arduino/avr/cores/arduino -I/ROOT/hardware/arduino/avr/variants/yun

$CC $CFLAGS $BOARD_FLAGS $INCLUDES /ROOT/hardware/arduino/avr/cores/arduino/wiring_digital.c -o wiring_digital.o

### 4 Add each object in core lib to core archive

/ROOT/hardware/tools/avr/bin/avr-ar rcs core.a wiring_digital.o

### 5 Link Sketch

/ROOT/hardware/tools/avr/bin/avr-gcc -Os -Wl,--gc-sections -mmcu=atmega32u4 -o sketch.cpp.elf sketch.cpp.o core.a -L$BUILDDIR -lm 

### 6 Make file objects

/ROOT/hardware/tools/avr/bin/avr-objcopy -O ihex -j .eeprom --set-section-flags=.eeprom=alloc,load --no-change-warnings --change-section-lma .eeprom=0 sketch.cpp.elf sketch.cpp.eep 

/ROOT/hardware/tools/avr/bin/avr-objcopy -O ihex -R .eeprom sketch.cpp.elf sketch.cpp.hex

