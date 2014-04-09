var fs = require('fs');

module.exports = function modified(inFile,outFile){
  if(!fs.existsSync(outFile))
    return true;

  var inTime = fs.statSync(inFile).mtime.getTime();
  var outTime = fs.statSync(outFile).mtime.getTime();
  if(inTime > outTime)
    return true;
  else
    return false;
}
