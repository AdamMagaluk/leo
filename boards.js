var board = require('leo-board');
var boardscan = require('./lib/boardscan');
var globaldir = require('./lib/globaldir')();

// Default arduino boards / platform
var arduinoBoards = require('leo-board-arduino');

var boards = {};
module.exports = boards;

//##############################################################
// require external boards as modules. patches boards.
if(globaldir) 
  boardscan(globaldir, boards);

// if arduino has not already been added from globaldir
if(!boards.yun && !boards.uno){
  Object.keys(arduinoBoards).forEach(function(name){
    boards[name] = arduinoBoards[name];
  });
}

