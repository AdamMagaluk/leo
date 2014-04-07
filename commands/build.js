var fs = require('fs')
  , path = require('path')
  , prompt = require('prompt')
  , async = require('async')
  , Handlebars = require('handlebars')
  , dirscan = require('../lib/dirscan');

var Program = null;

module.exports.setup = function(program){
  program
    .command('build [sketch]')
    .description('Build firmware for the project in the current directory.')
    .option('-o, --output [path]', 'Directory to put build files in. Defaults to .build','.build')
    .action(run);

  Program = program;
};

function getSketch(dir,callback){
  var sketches = dirscan(path.join(dir),['pde','ino'],1);

  if(sketches.length === 0)
    return callback(new Error('No sketches found in project.'));

  if(sketches.length === 1)
    return callback(null,sketches[0]);

  function getId(callback){
    console.log('Multiple Sketches Detected in project dir:')
    sketches.forEach(function(s,idx){
      console.log( ' ['+idx+'] - '+path.basename(s));
    });

    prompt.start();
    prompt.get('id',function(err,res){
      if(err)
        throw err;

      sketch = sketches[Number(res.id)];
      callback();
    });
  }

  var sketch = undefined;
  async.whilst(function(){return sketch === undefined;},getId,function(){
    callback(null,sketch);
  });
}

function run(sketch, env){
  if(!sketch)
    getSketch(process.cwd(),function(err,sketch){
      if(err)
        return console.error(err.message);
      
      buildSketch(sketch);
    });
  else
    buildSketch(sketch,env);
}

function make(makefile,ctx,callback){
  var file = path.join(__dirname,'../templates',(makefile+'.hbs'));
  var src = fs.readFileSync(file).toString();
  var template = Handlebars.compile(src);
  var result = template(ctx);
}

function fileObj(f){
  return {  
    ext : path.extname(f),
    dir : path.dirname(f),
    test : path.relative(process.cw),
    path : path.join(path.dirname(f),path.basename(f,path.extname(f))),
  };
}

function buildSketch(sketch,env){
  console.log('building ' + sketch);

  var ctx = {
    sketches : [sketch].map(fileObj),
    board : 'uno',
    leoPath : process.argv[1]
  };
  console.log(ctx);

  make('Makefile.sketch',ctx)
}

