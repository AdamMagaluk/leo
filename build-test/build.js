var path = require('path')
  , exec = require('child_process').exec
  , ntr = require('ntr')
  , dirscan = require('../lib/dirscan');

var arduinoPath = '/Applications/Arduino.app/Contents/Resources/Java';
var binDir = path.join(arduinoPath,'hardware/tools/avr/bin/');
///Applications/Arduino.app/Contents/Resources/Java/hardware/arduino/avr/cores/arduino/avr-libc/malloc.c

var coreFiles = dirscan(path.join(arduinoPath,'/hardware/arduino/avr/cores/arduino/'),['c','cpp']);
var projectFiles = ['sketch.cpp','hello.cpp'];

ntr()
  .env({gcc : path.join(binDir,'avr-gcc'),
	ar  : path.join(binDir,'avr-ar'),
        objcopy  : path.join(binDir,'avr-objcopy'),
        cflags : '-c -g -Os -w -ffunction-sections -fdata-sections -MMD',
        includes : [path.join(arduinoPath,'hardware/arduino/avr/cores/arduino'),path.join(arduinoPath,'hardware/arduino/avr/variants/yun')],
        boardFlags : '-mmcu=atmega32u4 -DF_CPU=16000000L -DARDUINO=155 -DARDUINO_AVR_YUN -DARDUINO_ARCH_AVR -DUSB_VID=2341 -DUSB_PID=0x8041 -DUSB_MANUFACTURER=\'""\' -DUSB_PRODUCT=\'"Arduino Yun"\' ',
        buildDir : '.build'})
  .add(coreFiles,compileFile)
  .add(projectFiles,compileFile)
  .add(projectFiles.map(toO),projectFiles,function(next){return next();})
  .add(coreFiles.map(toO),addToArchive)
  .add('arduino.a',coreFiles.map(toO),compileLib)
  .add('sketch.elf',['arduino.a'].concat(projectFiles.map(toO)),linkFiles)
  .add('sketch.eep',['sketch.elf'],objectToEep)
  .add('sketch.hex',['sketch.elf'],objectToHex)
  .done(function(err){
    if(err)
      console.log(err);    
    console.log('done')
  });

function toO(f){
  return toExt(f,'.o');
}
function toExt(f,ext){
  return path.basename(f,path.extname(f)) + ext;
}
function compileLib(next){
  // this.deps => ['file_a.c','file_b.c']
  // this.name = 'somelib.a'
  // this.env = {gcc : '/usr/bin/gcc',cflags : '-Wall '}

  var cmd = [this.env.gcc,this.env.cflags,'-o' ,this.name].concat(this.deps.map(toO).join(' ')).join(' ');
  // cmd => /usr/bin/gcc -Wall -o somelib.a file_a.o file_b.o
  //exec(cmd,next);
  next();
}

function objectToEep(next){
  var self = this;
  var flags = '-O ihex -j .eeprom --set-section-flags=.eeprom=alloc,load --no-change-warnings --change-section-lma .eeprom=0';
  var deps = this.deps.map(function(file){return path.join(self.env.buildDir,file);}).join(' ');
  var outFile = path.join(this.env.buildDir,toExt(this.name,'.hex'));
  var cmd = [this.env.objcopy,flags,deps,outFile].join(' ');
  console.log(cmd);
  exec(cmd,function(err,stdout,stderr){
    if(err){
      console.error(err)
      return next(err);
    }
    next();
  });
}

function objectToHex(next){
  var self = this;
  var flags = '-O ihex -R .eeprom';
  var deps = this.deps.map(function(file){return path.join(self.env.buildDir,file);}).join(' ');
  var outFile = path.join(this.env.buildDir,toExt(this.name,'.hex'));
  var cmd = [this.env.objcopy,flags,deps,outFile].join(' ');
  console.log(cmd);
  exec(cmd,function(err,stdout,stderr){
    if(err){
      console.error(err)
      return next(err);
    }
    next();
  });
}

function linkFiles(next){
  var self = this;
  var deps = this.deps.map(function(file){return path.join(self.env.buildDir,file );});
  var outFile = path.join(this.env.buildDir,this.name);
  
  console.log(deps)

  var cmd = [this.env.gcc,'-Wl,--gc-sections -mmcu=atmega32u4','-o',outFile,deps.join(' '),('-L'+this.env.buildDir),'-lm'].join(' ');
  console.log(cmd)
  exec(cmd,function(err,stdout,stderr){
    if(err){
      console.error(err)
      return next(err);
    }
    next();
  });
}

function addToArchive(next){
  var file = path.join(this.env.buildDir,this.name);
  var archive = path.join(this.env.buildDir,'arduino.a');
  var cmd = [this.env.ar,'rcs',archive,file].join(' ');
  exec(cmd,function(err,stdout,stderr){
    if(err){
      console.error(err)
      return next(err);
    }
    console.log(cmd)
    next();
  });
}

function compileFile(next){
  // this.deps => [];
  // this.name = 'file_a.c'
  var includes = '-I'+this.env.includes.join(' -I');
  var cmd = [this.env.gcc,this.env.cflags,this.env.boardFlags,includes,'-o', path.join(this.env.buildDir,toO(this.name)),this.name ].join(' ');
  console.log(cmd)
  exec(cmd, function callback(err, stdout, stderr){
    if(err){
      console.error(err)
      return next(err);
    }
    next();
  });
}
