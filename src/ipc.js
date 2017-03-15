/* eslint-disable */
// https://github.com/segmentio/nightmare/blob/master/lib%2Fipc.js

/**
 * Module dependencies
 */

var Emitter = require('events').EventEmitter;
// var sliced = require('sliced');

/**
 * Export `ipc`
 */

module.exports = ipc;

/**
 * Initialize `ipc`
 */

function ipc(process) {
  var emitter = new Emitter();
  var emit = emitter.emit;

  // no parent
  if (!process.send) {
    return emitter;
  }

  process.on('message', function(data) {
    // emit.apply(emitter, sliced(data));
    emit.apply(emitter, [...data]);
  });

  emitter.emit = function() {
    if(process.connected){
      // process.send(sliced(arguments));
      process.send(Array.from(arguments));
    }
  }

  return emitter;
}
