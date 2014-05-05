var fs = require('fs')
  , util = require('util')
  , path = require('path')
  , dirscan = require('./dirscan')
  , out = require('./output');

module.exports = function(dir,env){

  var ret = {name : path.basename(dir),files : [],main : null,srcFolder : null,rootFolder : dir,deps : []};
  ret.srcFolder = path.join(dir,'src');

  var packageFile = path.join(dir,'package.json');
  var packageJSON = {};
  if(fs.existsSync(packageFile)){
    try{
      var json = packageJson = JSON.parse(fs.readFileSync(packageFile));
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

  // support main field in package.json pointing to .ino or .pde
  if(packageJson.main && env.runtime.mainExtentions.indexOf(packageJson.main.split('.').pop()) > -1) {
    ret.main = packageJson.main;
  }

  if(fs.existsSync(ret.srcFolder)) {
    // if main was not in package.json look in srcdir
    if(!ret.main){
      ret.main = dirscan(ret.srcFolder,env.runtime.mainExtentions,1);
    }

    // scan for project files.
    ret.files = dirscan(ret.srcFolder,env.runtime.buildExtentions,1);
  }

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
