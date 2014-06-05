var exec = require('child_process').exec
  , path = require('path')
  , fs = require('fs')
  , traverse = require('traverse')
  , out = require('./output')
  , dirscanproject = require('./projectscan');

module.exports = LeoUpload;

function LeoUpload(env){
  if(!this instanceof LeoUpload)
    return new LeoUpload();

  this.env = env;
}

LeoUpload.prototype.serialUpload = function(port,dir,callback){
  this.project = dirscanproject(dir,this.env);

  var env = traverse(this.env).clone();
  env.serialPort = port;
  env.build.project_name = this.project.name;

  var func = this.env.tools.avrdude.upload.pattern;
  var cmd = func(env);

  task(cmd,callback);
};

LeoUpload.prototype.sshUpload = function(dir,callback){
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



