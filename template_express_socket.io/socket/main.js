/**
 * New node file
 */
var adminHandler = require('./adminHandler');
var clientHandler = require('./clientHandler');
 
var Q = require('q'); 

exports.bind = function(io){

	io.on('connection',function(socket){
		
		// for http://host.domain/admin
		adminHandler(socket, io);

		// for others
		clientHandler(socket, io);	

	});
}; 