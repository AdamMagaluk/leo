var spawn = require('child_process').spawn
, path = require('path')
, fs = require('fs')
, util = require('util')
, traverse = require('traverse')
, out = require('./output')
, dirscanproject = require('./projectscan');

module.exports = LeoUpload;

function LeoUpload(env) {
  if(!this instanceof LeoUpload) {
    return new LeoUpload();
  }

  this.env = env;
}

LeoUpload.prototype.serialUpload = function(port, dir, callback){
  this.project = dirscanproject(dir, this.env);

  var env = traverse(this.env).clone();
  env.serialPort = port;
  env.build.project_name = this.project.name;

  var func = this.env.tools.avrdude.upload.pattern;
  var cmd = func(env);
  
  task(cmd, callback);
};

LeoUpload.prototype.usageReport = function(dir, callback) {
  
};

LeoUpload.prototype.sshUpload = function(dir, callback) {
};

function task(cmdString, next){
  out.task(cmdString);

  var args = cmdString.match(/"([^"]+)"|\s*([^"\s]+)/g);
  var cmd = args[0];
  args.splice(0, 1);

  if (cmd[0] === '"' && cmd[cmd.length - 1] === '"') {
    cmd = cmd.substr(1, cmd.length - 2);
  }

  args = args.map(function(arg) {
    arg = arg.trim();
    if (arg[0] === '"' && arg[arg.length - 1] === '"') {
      arg = arg.substr(1, arg.length - 2);
    }
    return arg;
  });

  var prog = spawn(cmd, args);
  prog.stderr.pipe(process.stdout);

  prog.on('close', function (code) {
    if (code !== 0) {
      console.log('upload process exited with code ' + code);
    }
    next();
  });
}

function usage(cmdString, next) {

}
