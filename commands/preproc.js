var fs = require('fs');
var preproc = require('../lib/preproc');

module.exports.setup = function(program){
  program
    .command('preproc <sketch>')
    .description('Compile sketch to valid c++ source')
    .option('-o, --output [path]', 'Outputs the compiled sketch to the path given.')
    .action(run);
};

function run(sketch, options){
  var ret = preproc(sketch);
  if(ret instanceof Error)
    return console.error('Sketch "'+sketch+'" does not exist.');

  if(options.output === undefined)
    return console.log(ret);

  try {
    var fd = fs.openSync(options.output,'w+');
    fs.writeSync(fd, ret);
    fs.closeSync(fd);
  }catch(err){
    console.error(err);
  }
}