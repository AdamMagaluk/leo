# Arduino Command Line Build Tool

Command build tool for [Arduino][arduino] development built using
[Node.js][nodejs]. Allows installing library dependencies using the wonderful 
package manager [Npm][npm].

Inspiration taken from the [Ino][ino] project.

## Installation

`$ npm install -g leo`


## Basic Usage

Create a new example Blink project

`$ leo new Blink`

Move into project directory

`$ cd Blink`

Build hex file

`$ leo build -b yun`

`$ leo build -b uno`



## Usage

```
$ leo -h

  Usage: leo [options] [command]

  Commands:

    boards                 List boards available.
    build [options]        Build firmware for the project in the current directory.
    preproc [options] <sketch> Compile sketch to valid c++ source
    *

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```




## License

MIT

[nodejs]: http://nodejs.org/ "Node.js"
[arduino]: http://arduino.cc/ "Arduino"
[ino]: http://inotool.org/ "Ino Build Tool"
[npm]: http://npmjs.org/ "Node Package Manager"