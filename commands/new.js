var fs = require('fs')
  , path = require('path')
  , cpr = require('cpr')
  , out = require('../lib/output');

module.exports.setup = function(program){
  program
    .command('new <folder>')
    .description('Create a new example project')
    .action(run);
};

function run(folder, options){

  if(fs.existsSync(folder)){
    out.error('Output directory already exists.');
    process.exit(1);
  }

  // copy basic folder as project.
  var from = path.join(__dirname,'../examples/basic');

  cpr(from, folder, function(err, files) {
    if(err){
      out.error('Failed to create new project. Err:',err);
      process.exit(1);
    }
  });
}
