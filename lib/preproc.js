var fs = require('fs');

module.exports = preproc;

function preproc(input,output){
  try{
    var sketch = fs.readFileSync(input,{}).toString();
    var fd = fs.openSync(output,'w+');
  
    var prototypes = getPrototypes(sketch);
    var lines = sketch.split('\n');
    var p = parseIncludes(lines);

    fs.writeSync(fd,'#include <Arduino.h>\n');
    fs.writeSync(fd,p.includes.join('\n'));
    fs.writeSync(fd,'\n');

    fs.writeSync(fd,prototypes.join('\n'));
    fs.writeSync(fd,'\n');

    fs.writeSync(fd,'#line 1 "'+input+'"\n');
    fs.writeSync(fd,p.lines.join('\n'));

  }catch(err){
    return err;
  }
  return null;
}

function getPrototypes(sketch){
  var src = collapseBraces(strip(sketch));
  var regex = new RegExp("[\\w\\[\\]\\*]+\\s+[&\\[\\]\\*\\w\\s]+\\([&,\\[\\]\\*\\w\\s]*\\)(?=\\s*\\{)",'gim');
  return src.match(regex).map(function(m){return m + ';';})
}

function collapseBraces(sketch){
  var result = [];
  var nesting = 0;

  for(var i=0;i<sketch.length;i++){
    var c = sketch[i];
    if(!nesting){
      result.push(c);
    }

    if(c === '{'){
      nesting +=1;
    }else if(c === '}'){
      nesting -= 1;
      result.push(c);
    }
  }

  return ''+result.join('');
}

function parseIncludes(lines){
  var includes = [];
  lines.forEach(function(line,idx){
    var m = line.match("^\\s*#include\\s*[<\"](\\S+)[\">]");
    if(m){
      includes.push(line);
      lines[idx] = '//' + line;
    }
  });

  return {
    lines : lines,
    includes : includes
  }  
}

function strip(sketch){
  // single-quoted character
  var p = "('.')"
  
  // double-quoted string
  p += "|(\"(?:[^\"\\\\]|\\\\.)*\")"
  
  // single and multi-line comment
  p += "|(//.*?$)|(/\\*[^*]*(?:\\*(?!/)[^*]*)*\\*/)"
  
  // pre-processor directive
  p += "|" + "(^\\s*#.*?$)"

  var r = new RegExp(p,'gim');
  return sketch.replace(r,'');
}