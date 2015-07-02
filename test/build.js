var test = require('tape');
var LeoBuild = require('../lib/build');

test("init leoBuild",function(t){
  var leoBuild = new LeoBuild();

  t.ok(leoBuild.includes, [], 'no default includes');
  t.ok(leoBuild.libs, [], 'no default libs');
  t.ok(leoBuild.env, [], 'no default env');
  t.notOk(leoBuild.verbose, true, 'no verbose output');

  t.end();

});

test("init leoBuild with verbose output",function(t){
  var leoBuild = new LeoBuild({verbose: true});

  t.ok(leoBuild.verbose, true, 'enables verbose output');

  t.end();

});
