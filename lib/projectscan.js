var fs = require('fs')
  , util = require('util')
  , path = require('path')
  , dirscan = require('./dirscan')
  , out = require('./output');

var MAX_SCAN_DEPTH = 3;

module.exports = function(dir,env){

  var ret = { 
    name : path.basename(dir), // defaults to folder name
    files : [],
    main : null, // if no main is specified, assume library
    srcFolder : [path.join(dir,'src')], // default to project/src
    rootFolder : dir,
    deps : []
  };
  
  var packageFile = path.join(dir,'package.json');
  var packageJson = {};
  
  var extraSrcFolders = [];
  
  if(env.board.arch){
    extraSrcFolders.push(path.join(dir,'arch',env.board.arch));
  }
  
  if(fs.existsSync(packageFile)){
    try{
      var packageJson = JSON.parse(fs.readFileSync(packageFile));

      /// allow overriding of name with .name
      if(packageJson.name){
      	ret.name = packageJson.name;
      }

      // allow overriding files with .leoFiles
      if(packageJson.leoFiles && util.isArray(packageJson.leoFiles) ){
      	ret.files = packageJson.leoFiles.map(function(f){return path.join(dir,f);});
      }

    }catch(err){
      out.warn('JSON parsing of projects package.json failed. '+err.message);
    }
  }

  // support main field in package.json pointing to .ino or .pde
  if(packageJson.main && env.runtime.mainExtentions.indexOf(packageJson.main.split('.').pop()) > -1) {
    ret.main = packageJson.main;
  }

    // scan for dependencies
  var depFolder = path.join(dir,'node_modules');
  
  // warn if dep does not exist
  if(typeof packageJson.dependencies === 'object'){
    Object.keys(packageJson.dependencies).forEach(function(name){
      if(!fs.existsSync(path.join(depFolder,name))){
	out.warn('Dependency '+name+' does not exist. Try running `npm install`');
      }
    });
  }

  ret.depFolder = depFolder;
  if(fs.existsSync(depFolder)){
    ret.deps = fs.readdirSync(depFolder).filter(function(f){
      return fs.statSync(path.join(depFolder,f)).isDirectory();
    });
  }
  
  function scan(rootDir, depth){
    // if main was not in package.json look in srcdir
    if(!ret.main){
      ret.main = dirscan(rootDir, env.runtime.mainExtentions, depth);
    }

    // scan for project files.
    ret.files = dirscan(rootDir, env.runtime.buildExtentions, depth);
    
    // scan for extra src folders, project/:arch
    extraSrcFolders.forEach(function(folder){
      if(!fs.existsSync(folder))
	return;
      var files = dirscan(folder,env.runtime.buildExtentions, depth);
      ret.files = ret.files.concat(files);
      ret.srcFolder.push(folder);
    });
  }
  
  if(ret.files.length === 0){
    // if ret.files is not specified in json scan directory
    if(fs.existsSync(ret.srcFolder[0])) {
      scan(ret.srcFolder[0], MAX_SCAN_DEPTH);
    }else{
      // no source folder found, scan project dir but not recursivly
      scan(dir,1);
    }
  }

  
  // if building a directory with no package.json use main files name
  if(ret.name === '.' && ret.main.length > 0){
    ret.name = ret.main[0];
  }

  
  return ret;
};
