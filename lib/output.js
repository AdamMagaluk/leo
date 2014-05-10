var colors = require('colors');

var verbose = 1;

module.exports.verbose = function(level){
  verbose = level;
};

module.exports.task = function(txt){
  if(verbose > 1)
    console.log(txt.green)
};

module.exports.log = function(txt){
  if(verbose >= 1)
    console.log(txt.white);
};

module.exports.warn = function(txt){
  if(verbose >= 0)
    console.log(txt.yellow);
};

module.exports.error = function(txt){
  if(verbose < -1)
    return;

  if(typeof txt === 'object')
    txt = txt.message;
  console.error(txt.underline.red);
};
