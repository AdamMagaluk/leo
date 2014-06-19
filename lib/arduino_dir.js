var fs = require('fs');
var os = require('os');
var path = require('path');

var dirs = [];
dirs.push('/usr/local/share/arduino');
dirs.push('/usr/share/arduino')

if(os.platform() === 'darwin'){
  dirs.push('/Applications/Arduino.app/Contents/Resources/Java');
}

var ArduinoEnv = module.exports = function(){
  this.rootDir = '';
  this.version = null;
  this.platformPath = '';
  this.compilerPath = '';
  this.corePath = '';
  this.variantPath = '';
}

ArduinoEnv.prototype.init = function(root){
  this.rootDir = (root) ? root : this._locateRoot();
  this.version = this.getVersion();
};

ArduinoEnv.prototype._locateRoot = function(){
  var found = '';
  dirs.some(function(dir){
    if(fs.existsSync(dir)){
      found = dir;
      return true;
    }
  });
  
  return found;
}

ArduinoEnv.prototype.getVersion = function(){
  var file = path.join(this.rootDir, 'lib', 'version.txt');

  if(!fs.existsSync(file))
    return null;
  
  var version = fs.readFileSync(file, 'utf8').toString();  
  return version;
}
