var spawn = require('child_process').spawn
  , split = require('split')
  , through = require('through')
  , out  = require('../lib/output');

var Program = null;

module.exports.setup = function(program){
  program
    .command('search')
    .description('Search for supported libraries.')
    .action(run);

  Program = program;
};

function run(env){
  var terms = Array.prototype.slice.call(arguments).slice(0,-1);

  var opts = {};
  var cols = opts.cols || process.stdout.columns || Infinity;
  
  var args = [ 'search', '-s', '/\\.(ino)\\b/' ];
  
  var ps = spawn('npm', args.concat(terms), { stdio: [ 0, 'pipe', 2 ] })
  var lineNum = 0;
  
  var output = ps.stdout.pipe(split()).pipe(through(write));
  
  ps.on('exit', function (code) {
    if (code !== 0) {
      out.error('non-zero exit code running `npm`');
      process.exit(1);
    }
  });
  
  function write (buf) {
    var line = buf.toString('utf8');
    if (lineNum++ === 0 || /^\S+\.(ino)\s/.test(line)) {
      console.log(line.substr(0,cols));
    }
  }

}

