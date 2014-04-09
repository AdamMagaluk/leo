var ntr = require('ntr')
  , exec = require('child_process').exec
  , path = require('path')
  , fs = require('fs')
  , async = require('async')
  , out = require('./output')
  , toExt = require('./toExt')
  , dirscan = require('./dirscan')
  , preproc = require('./preproc')
  , modified = require('./modified')
  , dirscanproject = require('./dirscanproject')
  , env = require('../env');

function toO(file){return toExt(file,'.o');}

module.exports = build;

function build(dir,callback){
  var project = dirscanproject(dir);
  project.includes = [];
  project.libs = [];

  async.eachSeries(project.deps,function(folder,cb){
    folder = path.join(project.depFolder,folder);
    project.includes.push(folder);
    build(folder,cb);
  },function(err){
    if(err)
      return callback(err);

    if(project.main.length === 0){
      out.log('No main file detected building library.');
      return buildLib(project,dir,callback);
    }
    
    buildMain(project,dir,callback);  
  });
  
}


function buildMain(project,dir,callback){
  out.log('Building '+project.name+' as excutable.');
  
  console.log(project.includes)

  // 1. scan for core files
  var coreFiles = dirscan(env.corePath,env.buildExtentions);
  
  var projectFiles = project.files;
  var mainFile = project.main;
  
  if(mainFile.length > 1){
    out.warn('Multiple main files found. Choosing first one. '+path.basename(mainFile[0]))
    mainFile = mainFile[0];
  }

  projectFiles.push( toBuildDir.call({env : env},(toExt(mainFile,'.cpp'))) );

  env.includes.push(project.srcFolder);
  env.includes.push('../test-lib/src');

  env.archiveName = 'arduino.a';

  // 3. generate ntr make process
  ntr()
    .extend('toBuildDir',toBuildDir)
    .extend('modified',modified)
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


function buildLib(project,dir,callback){
  out.log('Building '+project.name+' as library.');
  
  var projectFiles = project.files;
  
  env.includes.push(project.srcFolder);
  env.archiveName = toExt(project.name,'.a');
  // 3. generate ntr make process
  ntr()
    .extend('toBuildDir',toBuildDir)
    .extend('modified',modified)
    .env(env)
    .add(projectFiles,compileFile)
    .add(projectFiles.map(toO),addToArchive)
    .add(env.archiveName,function(next){next()})
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
  var deps = this.deps.map(this.toBuildDir);
  var outFile = this.toBuildDir(toExt(this.name,'.eep'));
  var cmd = [this.env.objcopy,this.env.eepFlags,deps,outFile].join(' ');  
  task(cmd,next);
}

function objectToHex(next){
  var deps = this.deps.map(this.toBuildDir);
  var outFile = this.toBuildDir(toExt(this.name,'.hex'));
  var cmd = [this.env.objcopy,this.env.hexFlags,deps,outFile].join(' ');  
  task(cmd,next);
}

function linkFiles(next){
  var self = this;
  var deps = this.deps.map(this.toBuildDir).join(' ');
  deps += ' ../test-lib/.build/test-lib.a';
  var outFile = this.toBuildDir(this.name);
  var cmd = [this.env.gcc,this.env.ldflags,'-o',outFile,deps,('-L'+this.env.buildDir),'-lm'].join(' ');
  task(cmd,next);
}

function addToArchive(next){
  var file = this.toBuildDir(this.name);
  var archive = this.toBuildDir(this.env.archiveName); // TODO not always arduino.a
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


