var subdirs = require('../lib/subdirs')
  , dirscan = require('../lib/dirscan')


/*
/Applications/Arduino.app/Contents/Resources/Java/hardware/arduino/cores/arduino
lib
/Applications/Arduino.app/Contents/Resources/Java/libraries
*/

var src_dir = '/Users/ApigeeCorporation/Downloads/test-info/src';

console.log(subdirs("/Applications/Arduino.app/Contents/Resources/Java/libraries",['examples']))

//console.log(dirscan(src_dir,['c','cpp','cxx']));
