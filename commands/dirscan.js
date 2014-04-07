var fs = require('fs')
  , path = require('path')
  , prompt = require('prompt')
  , async = require('async')
  , Handlebars = require('handlebars')
  , dirscan = require('../lib/dirscan');

var Program = null;

module.exports.setup = function(program){
  program
    .command('dirscan [dir]')
    .description('Run dir scan.')
    .action(run);

  Program = program;
};

function run(dir, env){
  if(!dir)
    dir = process.cwd();

  var dirs = dirscan(dir);
  console.log(dirs)
}
