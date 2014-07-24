var path = require('path');
var walk = require('walkdir');
var dscan = require('./dirscan');

module.exports = boardscan; 

// dir in the regular use case will probably be global.
function boardscan(dir, boards) {
  var files = walk.sync(dir, { "follow_symlinks": true, max_depth: 1 });
  boards = boards || {};
  files.forEach(function(name) {
    var basename = path.basename(name);
    if(basename.indexOf('leo-board-') > -1) {
      try{
        var obj = require(name);
	Object.keys(obj).forEach(function(bname) {
	  // cannot patch any built in boards from modules?
	  if (boards[bname]) {
            return;
          }
	  
	  boards[bname] = obj[bname];
	});
      } catch(e) {
        // todo
        // require(erroroutput).log(...
        console.error(e);
        console.error("something is wrong with board ",name,' skipping');
      }
    }
  });

  return boards;

}
