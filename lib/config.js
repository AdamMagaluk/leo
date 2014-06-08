var fs = require('fs');
var path = require('path');
var rc = require('rc');
var ini = require('ini');
var deepcopy = require('deepcopy');
var dobj = require('dobj');

var ArduinoEnv = require('./arduino_dir');

var appname = 'leo';

// home folder for config file
var homeDirectory = (process.platform === "win32") ? process.env.USERPROFILE : process.env.HOME;

// local config file
var configFile = path.join(homeDirectory, '.'+appname+'rc');

var arduinoEnv = new ArduinoEnv();
arduinoEnv.init();

var defaults = {};
defaults.ide = {};
defaults.ide.path = arduinoEnv.rootDir;
defaults.ide.version = arduinoEnv.version;

defaults.buildExtentions = ['c','cpp','S'];
defaults.mainExtentions = ['pde','ino'];

defaults.build = {};
defaults.build.path = '.build';

// ini config with config file and defaults
var config = module.exports = rc(appname, defaults);

// Not sure if we should do this, could cause issue when ide dir moves

//if config file doesn't exist, create it
//if(!fs.existsSync(configFile)){
//  save();
//}

// set key on config object using dot notation for config. Eg: ide.path, 'some val'
config.set = function(key, val){
  dobj(config).set(key,val);
  save();
};

// get key from config using dot notation.
config.get = function(key){
  return dobj(config).get(key);
};

// delete key using dot notation
config.delete = function(key){
  dobj(config).del(key);
  save();
};

// List object in ini format
config.list = function(){
  return ini.stringify(cleanConfig(config));
};

// clean config object and save it to the config file
function save(){
  var copy = cleanConfig(config);
  fs.writeFileSync(configFile, ini.stringify(copy));
}

// remove special properties and function from object
function cleanConfig(config){
  var copy = deepcopy(config);
  delete copy['_'];
  delete copy['config'];
  for(var k in copy){
    if(typeof copy[k] === 'function')
      delete copy[k];
  }
  return copy;
}
