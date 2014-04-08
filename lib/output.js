var colors = require('colors');

module.exports.task = function(txt){
  console.log(txt.green)
};

module.exports.log = function(txt){
  console.log(txt.white);
};

module.exports.warn = function(txt){
  console.log(txt.yellow);
};

module.exports.error = function(txt){
  if(typeof txt === 'object')
    txt = txt.message;
  console.error(txt.underline.red);
};
