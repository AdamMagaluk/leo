var path = require('path');
var fs = require('fs');

module.exports = globaldir;

// note from `man npm-folders`
// Global installs on Unix systems go to {prefix}/lib/node_modules.  Global installs on Windows go to {prefix}/node_modules (that is, no lib folder.)

function globaldir(){
  // node dir
  var dir = path.resolve(process.execPath,'../../');

  var winDir = path.join(dir,'node_modules');
  var nixDir =path.join(dir,'lib','node_modules');

  // windows
  if(fs.existsSync(winDir)){
    return winDir;
  }

  // *nix
  if(fs.existsSync(nixDir)){
    return nixDir;
  } 

  // something is wrong. maybe no global modules yet
  // in any case there is nothing to scan.
  return false;
}
