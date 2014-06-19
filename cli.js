var fs = require('fs');
var path = require('path');
var program = require('commander');
var pkg = require('./package.json');

var out = require('./lib/output');

program
  .version(pkg.version);

function requireCommand(f){
  var m = require(path.join(__dirname,'./commands',f));

  if(!m.setup || typeof m.setup !== 'function')
    throw new Error('Command must export setup as a function.')

  m.setup(program);

  return m;
}

fs.readdirSync(path.join(__dirname,'./commands')).map(requireCommand);

function increaseVerbosity(v,total){
  out.verbose(v);
  return v;
}

program
  .option('-v, --verbose [value]', 'Verbose level', increaseVerbosity, 1)
  .command('*')
  .action(function(env){
    out.error('Command not found');
    program.help();
  });

program.parse(process.argv);

if(program.args.length === 0)
  return program.help();
