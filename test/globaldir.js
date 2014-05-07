var test = require('tape');
var globaldir = require('../lib/globaldir');
var fs = require('fs');

test("can find global node_modules dir",function(t){

  var d = globaldir();

  t.ok(d,'should have returned a dir');
  t.ok(fs.existsSync(d),'diretory should be real');

  t.end();

})
