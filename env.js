var path = require('path');

var env = {};


env.buildExtentions = ['c','cpp']; // files to build with project
env.mainExtentions = ['ino','pde']; // main files

env.arduinoPath = '/Applications/Arduino.app/Contents/Resources/Java';
env.binPath = path.join(env.arduinoPath,'hardware/tools/avr/bin/');
env.corePath = path.join(env.arduinoPath,'hardware/arduino/avr/cores/arduino');

['gcc','g++','ar','objcopy'].forEach(function(tool){
  env[tool] = path.join(env.binPath,'avr-'+tool);
});

env.board = 'yun';

env.includes = [];
env.includes.push(path.join(env.arduinoPath,'hardware/arduino/avr/cores/arduino'));
env.includes.push(path.join(env.arduinoPath,'hardware/arduino/avr/variants/'+env.board));
env.buildDir = '.build';

var boardFlags = '-mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=155 -DARDUINO_AVR_YUN -DARDUINO_ARCH_AVR -DUSB_VID=2341 -DUSB_PID=0x8041 -DUSB_MANUFACTURER=\'""\' -DUSB_PRODUCT=\'"Arduino Yun"\' ';
env.cflags = '-g -Os -w -ffunction-sections -fdata-sections -MMD ' + boardFlags;
env.ldflags = '-Os -Wl,--gc-sections -mmcu=atmega32u4';

env.eepFlags = '-O ihex -j .eeprom --set-section-flags=.eeprom=alloc,load --no-change-warnings --change-section-lma .eeprom=0';
env.hexFlags = '-O ihex -R .eeprom';

module.exports = env;

