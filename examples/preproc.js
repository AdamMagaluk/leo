var preproc = require('../lib/preproc');

var r = preproc('src/sketc2h.pde','./sketch.cpp');
if(r)
  console.error(r);