var serialPort = require("serialport");

module.exports = function(callback) {
  serialPort.list(function (err, ports) {
    if (err) {
      return callback(err);
    }

    ports.sort(function(a, b) {
      if (a.manufacturer.toLowerCase().indexOf('arduino')) return  1;
      if (b.manufacturer.toLowerCase().indexOf('arduino')) return  1;
      return 0;
    });

    return callback(null, ports);
  });  
};
