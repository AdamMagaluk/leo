var fs = require('fs')
  , path = require('path');
  
module.exports = subdirs;

function isDirectory(dir,base){
  var stat = fs.statSync(path.join(dir,base));
  return stat.isDirectory();
}

function filterExcludes(excludes,base){
  return excludes.indexOf(base) === -1;
}

function filterHidden(name){
  return name.substr(0,1) !== '.';
}


/*
 Return a list of folder paths exclude any paths that match
 the excludes param. Also includes subfolders
*/
function subdirs(base,excludes){

  var subDirs = fs.readdirSync(base).filter(isDirectory.bind(null,base));

  if(typeof excludes === 'function')
    subDirs = subDirs.filter(excludes);
  else if(excludes !== undefined)
    subDirs = subDirs.filter(filterExcludes.bind(null,excludes));

  subDirs = subDirs.filter(filterHidden);

  var all = [];
  for(var i=0;i<subDirs.length;i++){
    var rp = path.resolve(path.join(base,subDirs[i]));
    all.push(rp);
    all = all.concat(subdirs(rp,excludes));
  }

  return all;
}
