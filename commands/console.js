var SerialPort = require("serialport").SerialPort
  , boards = require('../boards')
  , runtime = require('../lib/config')
  , out  = require('../lib/output');

var Program = null;

module.exports.setup = function(program){
  program
    .command('console')
    .description('Open a serial console to the board for debugging.')
    .option('-p, --port [port]', 'Serial port to use.')
    .option('-b, --baud [baud]', 'Baud rate. Defaults to 9600', 9600)
    .action(run);

  Program = program;
};

function run(env){
  if(!env.port){
    out.error('Serial port not specified.');
    process.exit(1);
  }
  


  var serialPort = new SerialPort(env.port, {
    baudrate: env.baud
  });

  serialPort.on("open", function () {
    out.log('Console open, use Ctr-c to exit.\r\n');

    process.stdin.setEncoding('utf8');

    process.stdin.on('readable', function() {
      var chunk = process.stdin.read();
      if (chunk !== null) {
	serialPort.write(chunk.toString());
      }
    });

    process.stdin.on('end', function() {
      process.stdout.write('end');
      serialPort.close();
    });

    serialPort.on('data', function(buf){
      process.stdout.write(buf.toString());
    });

  });

  serialPort.on('error', function(err){
    out.error(err.message);
    process.exit(2);
  });

}

