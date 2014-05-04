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
  , dirscanproject = require('./projectscan');

function toO(file){return toExt(file,'.o');}

module.exports = LeoBuild;

function LeoBuild(env){
  if(!this instanceof LeoBuild)
    return new LeoBuild();

  this.includes = [];
  this.libs = [];
  this.env = env;
}


LeoBuild.prototype.build = function(dir,callback){
  var self = this;
  var project = dirscanproject(dir,this.env);
  
  console.log(project)

  this.includes.push(project.srcFolder);

  async.eachSeries(project.deps,function(folder,cb){
    self.build(path.join(project.depFolder,folder),cb);
  },function(err){
    if(err)
      return callback(err);
    

    // check if project is a lib
    if(project.main.length === 0){
      out.log('No main file detected building library.');
      return self.buildLib(project,dir,callback);
    }

    self.buildMain(project,dir,callback);
  });
  
}


LeoBuild.prototype.buildMain = function(project,dir,callback){
  out.log('Building '+project.name+' as excutable.');
  
  // 1. scan for core files
  var coreFiles = dirscan(this.env.corePath,this.env.buildExtentions);
  
  var projectFiles = project.files;
  var mainFile = project.main;
  
  if(mainFile.length > 1){
    out.warn('Multiple main files found. Choosing first one. '+path.basename(mainFile[0]))
    mainFile = mainFile[0];
  }

  projectFiles.push( toBuildDir.call({env : this.env},(toExt(mainFile,'.cpp'))) );

  var includes = this.includes.map(function(f){
    var d=path.join('../',f);
    return d;
  });
  
  this.env.includes.push(project.srcFolder);
  this.env.archiveName = 'arduino.a';

  var libs = ['arduino.a'].concat(this.libs);
  ntr()
    .extend('toBuildDir',toBuildDir)
    .extend('modified',modified)
    .env(this.env)
    .add(mainFile,preprocFile)
    .add(coreFiles,compileFile)
    .add(projectFiles,compileFile)
    .add(projectFiles.map(toO),projectFiles,function(next){return next();})
    .add(coreFiles.map(toO),addToArchive)
    .add(libs,function(next){next()})
    .add(toExt(project.name,'.elf'),libs.concat(projectFiles.map(toO)),linkFiles)
    .add(toExt(project.name,'.eep'),[toExt(project.name,'.elf')],objectToEep)
    .add(toExt(project.name,'.hex'),[toExt(project.name,'.elf')],objectToHex)
    .done(callback);
};


LeoBuild.prototype.buildLib = function(project,dir,callback){
  out.log('Building '+project.name+' as library.');
  
  var projectFiles = project.files;
  
  this.env.includes.push(project.srcFolder);
  this.env.archiveName = toExt(project.name,'.a');
  this.libs.push(this.env.archiveName);

  ntr()
    .extend('toBuildDir',toBuildDir)
    .extend('modified',modified)
    .env(this.env)
    .add(projectFiles,compileFile)
    .add(projectFiles.map(toO),addToArchive)
    .add(this.env.archiveName,function(next){next()})
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
  var outFile = this.toBuildDir(this.name);
  var cmd = [this.env.gcc,this.env.ldflags,'-o',outFile,deps,('-L'+this.env.buildDir),'-lm'].join(' ');
  task(cmd,next);
}

function addToArchive(next){
  var file = this.toBuildDir(this.name);
  var archive = this.toBuildDir(this.env.archiveName);
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


