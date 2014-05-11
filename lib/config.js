var fs = require('fs');
var path = require('path');
var rc = require('rc');
var ini = require('ini');
var deepcopy = require('deepcopy');
var dobj = require('dobj');

var appname = 'leo';

var win = process.platform === "win32";
var home = win ? process.env.USERPROFILE : process.env.HOME;

// local file
var file = path.join(home,'.'+appname+'rc');

var defaults = {};
defaults.ide = {};
defaults.ide.path = '/Applications/Arduino.app/Contents/Resources/Java';
defaults.ide.version = 155;

defaults.buildExtentions = ['c','cpp','S'];
defaults.mainExtentions = ['pde','ino'];

var config = module.exports = rc(appname, defaults);

if(!fs.existsSync(file)){
  save();
}


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

function save(){
  var copy = cleanConfig(config);
  fs.writeFileSync(file, ini.stringify(copy));
}

config.set = function(key, val){
  dobj(config).set(key,val);
  save();
};

config.get = function(key){
  return dobj(config).get(key);
};

config.delete = function(key){
  dobj(config).del(key);
  save();
};

config.list = function(){
  return init.stringify(cleanConfig(config));
};
