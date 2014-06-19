var fs = require('fs');

module.exports = preproc;

function preproc(input){
  try{
    var sketch = fs.readFileSync(input,{}).toString();
    
    var output = '';
    var prototypes = getPrototypes(sketch);
    var lines = sketch.split('\n');
    var p = parseIncludes(lines);

    output += '#include <Arduino.h>\n';
    output += p.includes.join('\n');
    output += '\n';

    output += prototypes.join('\n');
    output += '\n';

    output += '#line 1 "' + input.replace(/\\/g, "\\\\") + '"\n';
    output += p.lines.join('\n');

    return output;
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
