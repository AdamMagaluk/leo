var dscan = require('./dirscan');
var path = require('path');

module.exports = boardscan; 

// dir in the regular use case will probably be global.
function boardscan(dir,boards){
  var files = dscan(dir,false,1);

  boards = boards||{};

  files.forEach(function(name){

    var basename = path.basename(name);
    if(basename.indexOf('leo-board-') > -1) {

      var bname = basename.replace(/^leo-board-/,'');
      // cannot patch any built in boards from modules?
      if(boards[bname]) return;

      try{
        boards[bname] = require(name)();
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
