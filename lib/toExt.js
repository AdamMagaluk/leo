var path = require('path');

module.exports = function toExt(f,ext){
  return path.basename(f,path.extname(f)) + ext;
}
