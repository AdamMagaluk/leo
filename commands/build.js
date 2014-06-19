var boards = require('../boards')
  , config = require('../lib/config')
  , out  = require('../lib/output')
  , LeoBuild = require('../lib/build');

var Program = null;

module.exports.setup = function(program){
  program
    .command('build')
    .description('Build firmware for the project in the current directory.')
    .option('-b, --board [board]', 'Board name to compile and upload for. See `leo boards`')
    .action(run);

  Program = program;
};

function run(env){

  if(config.ide.path === ''){
    out.error('Unable to find Arduino IDE path. You can set it manually by running `leo config set ide.path \'/some/path\'`');
    process.exit(1);
  }

  if(!env.board){
    out.error('Board not specified.');
    process.exit(1);
  }
  
  var board = boards[env.board];
  if(board === undefined){
    out.error('Board `'+env.board+'` not found. Use `leo boards` to list available boards.');
    process.exit(1);
  }

  // Setup build 
  var env = board.platform(config, board.build, board);

  var b = new LeoBuild(env);
  b.build('.',function(err){
    if(err)
      return out.error(err);

    out.log('Successfully built project.');
  });

}

