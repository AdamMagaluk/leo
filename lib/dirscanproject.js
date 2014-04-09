var fs = require('fs')
  , util = require('util')
  , path = require('path')
  , dirscan = require('./dirscan')
  , out = require('./output')
  , env = require('../env');

module.exports = function(dir){
  var ret = {name : path.basename(dir),files : [],main : null,srcFolder : null,deps : []};
  ret.srcFolder = path.join(dir,'src');

  ret.main = dirscan(ret.srcFolder,env.mainExtentions,1);

  var packageFile = path.join(dir,'package.json');
  if(fs.existsSync(packageFile)){
    try{
      var json = JSON.parse(fs.readFileSync(packageFile));
      if(json.name){
	ret.name = json.name;
      }
      if(json.leoFiles && util.isArray(json.leoFiles) ){
	ret.files = json.leoFiles.map(function(f){return path.join(dir,f);});
      }
    }catch(err){
      out.warn('JSON parsing of projects package.json failed. '+err.message);
    }
  }
  
  // scan for project files.
  ret.files = dirscan(ret.srcFolder,env.buildExtentions,1);

  // scan for dependencies
  var depFolder = path.join(dir,'node_modules');
  ret.depFolder = depFolder;
  if(fs.existsSync(depFolder)){
    ret.deps = fs.readdirSync(depFolder).filter(function(f){
      return fs.statSync(path.join(depFolder,f)).isDirectory();
    });
  }
  
  return ret;
};
