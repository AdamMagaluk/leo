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


Upload hex file

`$ leo upload -b uno -p /dev/tty.usbmodem1141`

Open a serial console

`$ leo console -p /dev/tty.usbmodem1141 -b 9600`

Search for supported libraries

`$ leo search wifi`


## Using Dependencies

Example shows how you can install dependencies using npm. All modules provided by
Arduino are added to npm as {module}.ino for instance wifi.ino is added to the
Blink project. Note: Wifi.ino depends on SPI.ino which is automatically resolved.

```
$ leo new Blink
$ cd Blink
$ npm install wifi.ino --save
$ leo build -b uno
```

## Finding Libraries

You can use the `leo search` command to search npm:


```
$ leo search arduino
NAME     DESCRIPTION                                                 AUTHOR       DATE       VERSIO
spi.ino  Spi library for Arduino. Packaged for the leo build system. =adammagaluk 2014-05-08 0.0.1
wifi.ino Libary for the Arduino WiFi shield. Packaged for the leo…   =adammagaluk 2014-05-08 0.1.2
```

`leo search` just filters `npm search` by packages ending in `.ino`.

## Usage

```
$ leo -h
  Usage: leo [options] [command]

  Commands:

    boards                 List boards available.
    build [options]        Build firmware for the project in the current directory.
    config [options]       Modify leo configuration
    console [options]      Open a serial console to the board for debugging.
    new <folder>           Create a new example project
    preproc [options] <sketch> Compile sketch to valid c++ source
    search                 Search for supported libraries.
    upload [options]       Upload firmware to device.
    *

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -v, --verbose [value]  Verbose level
```

## License

MIT

[nodejs]: http://nodejs.org/ "Node.js"
[arduino]: http://arduino.cc/ "Arduino"
[ino]: http://inotool.org/ "Ino Build Tool"
[npm]: http://npmjs.org/ "Node Package Manager"
