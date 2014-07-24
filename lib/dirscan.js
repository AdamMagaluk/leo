var fs = require('fs');
var path = require('path');
var walk = require('walkdir');

module.exports = dirscan;

/**
 Return a list of file paths that match the extentions
 param in the dir and any sub dirs. Does not return on folders or symlink dirs
*/
function dirscan(dir, exts, depth){
  function match(e){
    if (!fs.lstatSync(e).isFile()) {
      return false;
    }
    
    if (!exts) {
      return true;
    }
    return exts.indexOf(path.extname(e).substr(1)) !== -1;
  }

  if (!fs.existsSync(dir)) {
    console.error(dir)
    throw new Error('Tried to directory scan a non-existant directory');
  }

  return walk.sync(dir, { "follow_symlinks": true, max_depth: depth }).filter(match);
}
