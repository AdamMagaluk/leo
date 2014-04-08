var fs = require('fs')
  , path = require('path')
  , build = require('../lib/build')

var Program = null;

module.exports.setup = function(program){
  program
    .command('build')
    .description('Build firmware for the project in the current directory.')
    .action(run);

  Program = program;
};

function run(env){
  console.log('building')
  build('.',function(err){
    console.log(err);
  })
}

