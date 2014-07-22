var boards = require('../boards')
  , config = require('../lib/config')
  , out  = require('../lib/output')
  , LeoUpload = require('../lib/upload');

var Program = null;

module.exports.setup = function(program){
  program
    .command('upload')
    .description('Upload firmware to device.')
    .option('-b, --board [board]', 'Board name to compile and upload for. See `leo boards`')
    .option('-p, --port [port]', 'Serial port to use.')
    .action(run);

  Program = program;
};

function run(env){

  if(config.ide.path === ''){
    out.error('Unable to find Arduino IDE path. You can set it manually by running `leo config set ide.path \'/some/path\'`');
    process.exit(1);
  }
  
  if(!env.board){
    out.error('Board not specified. -b');
    process.exit(1);
  }

  if(!env.port) {
    out.error('serial port not specified. -p ');
    process.exit(1);
  }

  var board = boards[env.board];
  if(board === undefined){
    out.error('Board `'+env.board+'` not found. Use `leo boards` to list available boards.');
    process.exit(1);
  }

  // Setup build 
  var setup = board.platform(config, board.build, board);

  var b = new LeoUpload(setup);

  b.serialUpload(env.port,'.',function(err){
    if(err)
      return out.error(err)

    out.log('Successfully uploaded hex file.');
  });

}

