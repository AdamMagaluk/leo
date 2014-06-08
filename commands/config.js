var out  = require('../lib/output')
  , config = require('../lib/config');

var Program = null;

module.exports.setup = function(program){
  program
    .command('config')
    .description('Modify leo configuration')
    .option('-f, --file [file]', 'Config file to modify.')
    .action(run)
    .command('set <key> <value>','set config <key> <value>')
    .command('get <key>','get config <key>')
    .command('delete <key>','delete config <key>')
    .command('list','list current config');


  Program = program;
};

function run(){
  var args = Array.prototype.slice.call(arguments);
  var cmd = args[0];

  if(!commands[cmd]){
    cmd.help();
  }

  commands[cmd].apply(null,args.slice(1,-1));

}

var commands = {};
commands.set = function(key,val){
  if(!key || !val){
    out.error('Must supply key and value');
    process.exit(1);
  }
  
  try{
    config.set(key, val);
  }catch(err){
    out.error(err.message);
  }
  
};
commands.get = function(key){
  if(!key){
    out.error('Must supply key');
    process.exit(1);
  }

  out.log(key+' = '+config.get(key));
};

commands.delete = function(key){
  if(!key){
    out.error('Must supply key');
    process.exit(1);
  }


  try {
    config.delete(key);
  }catch(err){
    out.error(err.message);
  }
};

commands.list = function(){
  out.log(config.list())
};
