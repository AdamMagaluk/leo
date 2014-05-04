var boards = require('../boards');

var Program = null;

module.exports.setup = function(program){
  program
    .command('boards')
    .description('List boards available.')
    .action(run);

  Program = program;
};

function run(env){
  for(var key in boards){
    console.log(key,':',boards[key].name);
  }
}

