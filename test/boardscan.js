var test = require('tape');
var boardscan = require('../lib/boardscan');


test("can scan for boards",function(t){

  var boards = {};

  var rboards = boardscan(__dirname,boards)
  t.equals(rboards,boards,'should be same object');

  t.ok(boards.fake,'should have fake board if scanned the test dir');
  t.end();

})
