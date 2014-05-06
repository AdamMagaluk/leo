
var boards = require('../../boards.js');

var b = boards[Object.keys(boards)[0]];

module.exports = function(){
  return b;
}


