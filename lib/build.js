var ntr = require('ntr')
  , traverse = require('traverse')
  , exec = require('child_process').exec
  , path = require('path')
  , fs = require('fs')
  , util = require('util')
  , rmdir = require('rmdir-recursive').sync
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

  this.includes = [].concat(env.includes);
  this.libs = [];
  this.env = env;
}

LeoBuild.prototype.makeBuildDir = function(){
  fs.mkdirSync(this.env.build.path);
};

LeoBuild.prototype.clean = function(){
  rmdir(this.env.build.path);
};

LeoBuild.prototype.build = function(dir,callback){

  if(!this.cleaned){
    out.log('Cleaning build directory');
    this.clean();
    
    out.log('Creating new build directory');
    this.makeBuildDir();
    this.cleaned = true;
  }
  
  var self = this;
  var project = dirscanproject(dir,this.env);
  
  this.includes.concat(project.srcFolder);

  async.eachSeries(project.deps,function(folder,cb){
    self.build(path.join(project.depFolder,folder),cb);
  },function(err){
    if(err)
      return callback(err);

    // check if project is a lib
    if(project.main.length === 0){
      return self.buildLib(project,dir,callback);
    }

    self.buildMain(project,dir,callback);
  });
  
}


LeoBuild.prototype.buildMain = function(project,dir,callback){
  out.log('Building '+project.name+' as excutable.');
  
  // 1. scan for core files
  var coreFiles = dirscan(this.env.compiler.corePath,this.env.runtime.buildExtentions);
  
  var projectFiles = project.files;
  var mainFile = project.main;
  
  if(mainFile.length > 1){
    out.warn('Multiple main files found. Choosing first one. '+path.basename(mainFile[0]))
    mainFile = mainFile[0];
  }

  projectFiles.push( toBuildDir.call({env : this.env},(toExt(mainFile,'.cpp'))) );
  
  this.env.includes = this.env.includes.concat(project.srcFolder);
  this.env.archive_file = 'arduino.a';

  // reverse to allow dependent libs to be included first
  var libs = this.libs.reverse();

  ntr()
    .extend('toBuildDir', toBuildDir)
    .extend('modified', modified)
    .env(this.env)
    .add(mainFile, preprocFile)
    .add(coreFiles, compileFile)
    .add(projectFiles, compileFile)
    .add(projectFiles.map(toO), projectFiles, function(next){return next();})
    .add(coreFiles.map(toO), addToArchive)
    .add(libs, function(next){next()})
    .add(toExt(project.name,'.elf'), projectFiles.map(toO).concat(libs), linkFiles)
    .add(toExt(project.name,'.eep'), [toExt(project.name,'.elf')], objectToEep)
    .add(toExt(project.name,'.hex'), [toExt(project.name,'.elf')], objectToHex)
    .done(callback);
};


LeoBuild.prototype.buildLib = function(project,dir,callback){
  out.log('Building '+project.name+' as library.');
  
  var projectFiles = project.files;

  // allow for multiple source folders in lib
  this.env.includes = this.env.includes.concat(project.srcFolder);

  this.env.archive_file = toExt(project.name,'.a');
  this.libs.push(this.env.archive_file);

  ntr()
    .extend('toBuildDir',toBuildDir)
    .extend('modified',modified)
    .env(this.env)
    .add(projectFiles,compileFile)
    .add(projectFiles.map(toO),addToArchive)
    .add(this.env.archive_file,function(next){next()})
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
  return path.join(this.env.build.path+'/',name);
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
  var func = this.env.recipe.objcopy.eep.pattern;
  var env = traverse(this.env).clone();
  env.build.project_name = toExt(this.name,'');  
  var cmd = func(env);
  task(cmd,next);
}

function objectToHex(next){
  var func = this.env.recipe.objcopy.hex.pattern;
  var env = traverse(this.env).clone();
  env.build.project_name = toExt(this.name,'');
  var cmd = func(env);
  task(cmd,next);
}

function inQuotes(f){
  return '"' + f + '"';
}

function linkFiles(next){
  var func = this.env.recipe.c.combine.pattern;
  var env = traverse(this.env).clone();
  env.build.project_name = toExt(this.name,'');
  env.object_files = this.deps.map(this.toBuildDir).map(inQuotes).join(' ');  
  var cmd = func(env);
  task(cmd,next);
}

function addToArchive(next){
  var func = this.env.recipe.ar.pattern;
  var env = traverse(this.env).clone();
  env.object_file = this.toBuildDir(this.name);
  var cmd = func(env);

  task(cmd,next);
}

function compileFile(next){
  var func = this.env.recipe[path.extname(this.name).substr(1)].o.pattern;
  var env = traverse(this.env).clone();
  env.includes = '-I'+env.includes.map(inQuotes).join(' -I');
  env.source_file = this.name;
  env.object_file = this.toBuildDir(toExt(this.name,'.o'));
  var cmd = func(env);
  task(cmd,next);
}


