var pad = require('pad');
var listPorts = require('../lib/listPorts');
var out  = require('../lib/output');

var Program = null;

module.exports.setup = function(program){
  program
    .command('ports')
    .description('List ports available.')
    .action(run);

  Program = program;
};

function run(env){

  listPorts(function(err, ports) {
    if (err) {
      out.error('Failed to scan os for ports', err);
      process.exit(1);
    }
    
    ports.forEach(function(port) {
      out.log(pad(port.comName, 40) + ' ' + port.manufacturer)
    });
    
  });
}

