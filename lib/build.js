var ntr = require('ntr')
  , exec = require('child_process').exec
  , path = require('path')
  , fs = require('fs')
  , out = require('./output')
  , toExt = require('./toExt')
  , dirscan = require('./dirscan')
  , preproc = require('./preproc')
  , env = require('../env');

function toO(file){return toExt(file,'.o');}

module.exports = function build(dir,callback){
  
  // 1. scan for core files
  var coreFiles = dirscan(env.corePath,env.buildExtentions);

  // 2. scan for project files.
  var projectFiles = dirscan(dir,env.buildExtentions,1);
  var mainFile = dirscan(dir,env.mainExtentions,1);
  
  if(mainFile.length < 1){
    out.error('Main file was not found, looking for a .ino or .pde file.');
    callback(new Error('No main file found.'))
    return;
  }

  if(mainFile.length > 1){
    out.warn('Multiple main files found. Choosing first one. '+path.basename(mainFile[0]))
    mainFile = mainFile[0];
  }

  projectFiles.push( toBuildDir.call({env : env},(toExt(mainFile,'.cpp'))) );

  env.includes.push(dir);

  // 3. generate ntr make process
  ntr()
    .extend('toBuildDir',toBuildDir)
    .env(env)
    .add(mainFile,preprocFile)
    .add(coreFiles,compileFile)
    .add(projectFiles,compileFile)
    .add(projectFiles.map(toO),projectFiles,function(next){return next();})
    .add(coreFiles.map(toO),addToArchive)
    .add('arduino.a',function(next){next()})
    .add('sketch.elf',['arduino.a'].concat(projectFiles.map(toO)),linkFiles)
    .add('sketch.eep',['sketch.elf'],objectToEep)
    .add('sketch.hex',['sketch.elf'],objectToHex)
    .done(callback);
};

function task(cmd,next){
  out.task(cmd);
  exec(cmd,function(err,stdout,stderr){
    if(err){
      out.error(err)
      return next(err);
    }
    next();
  });
}

function toBuildDir(name){
  return path.join(this.env.buildDir+'/',name);
}

function preprocFile(next){
  var outFile = this.toBuildDir(toExt(this.name,'.cpp'));
  var ret = preproc(this.name);
  if(ret instanceof Error){
    out.error('Sketch "'+sketch+'" does not exist.');
    return next(new Error('Sketch "'+sketch+'" does not exist.'));
  }

  try {
    var fd = fs.openSync(outFile,'w+');
    fs.writeSync(fd, ret);
    fs.closeSync(fd);
    next();
  }catch(err){
    out.error(err);
    return next(err);
  }

}

function objectToEep(next){
  var self = this;;
  var deps = this.deps.map(this.toBuildDir);
  var outFile = this.toBuildDir(toExt(this.name,'.eep'));
  var cmd = [this.env.objcopy,this.env.eepFlags,deps,outFile].join(' ');  
  task(cmd,next);
}

function objectToHex(next){
  var self = this;;
  var deps = this.deps.map(this.toBuildDir);
  var outFile = this.toBuildDir(toExt(this.name,'.hex'));
  var cmd = [this.env.objcopy,this.env.hexFlags,deps,outFile].join(' ');  
  task(cmd,next);
}

function linkFiles(next){
  var self = this;
  var deps = this.deps.map(this.toBuildDir).join(' ');
  var outFile = this.toBuildDir(this.name);
  var cmd = [this.env.gcc,this.env.ldflags,'-o',outFile,deps,('-L'+this.env.buildDir),'-lm'].join(' ');
  task(cmd,next);
}

function addToArchive(next){
  var file = this.toBuildDir(this.name);
  var archive = this.toBuildDir('arduino.a'); // TODO not always arduino.a
  var cmd = [this.env.ar,'rcs',archive,file].join(' ');
  task(cmd,next);
}

function compileFile(next){
  var includes = '-I'+this.env.includes.join(' -I');
  var outFile = this.toBuildDir(toExt(this.name,'.o'));
  var tool = (path.extname(this.name) === '.c') ? this.env.gcc : this.env['g++'];
  var cmd = [tool,this.env.cflags,includes,'-c -o',outFile,this.name ].join(' ');
  task(cmd,next);
}


