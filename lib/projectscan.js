var fs = require('fs')
  , util = require('util')
  , path = require('path')
  , dirscan = require('./dirscan')
  , out = require('./output');

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
  
  var extraSrcFolders = [ path.join(dir,'arch',env.board.arch) ];

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
  
  // if ret.files is not specified in json scan directory
  if(ret.files.length === 0 &&  fs.existsSync(ret.srcFolder[0])) {
    // if main was not in package.json look in srcdir
    if(!ret.main){
      ret.main = dirscan(ret.srcFolder[0], env.runtime.mainExtentions, 3);
    }

    // scan for project files.
    ret.files = dirscan(ret.srcFolder[0], env.runtime.buildExtentions, 3);
    
    
    // scan for extra src folders, project/:arch
    extraSrcFolders.forEach(function(folder){
      if(!fs.existsSync(folder))
	return;
      var files = dirscan(folder,env.runtime.buildExtentions);
      ret.files = ret.files.concat(files);
      ret.srcFolder.push(folder);
    });
    
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
