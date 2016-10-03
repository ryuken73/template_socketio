/**
 * New node file
 */

module.exports = function(socket, io){

	socket.on('adminInit',function(data){
		global.logger.trace('get adminInit');
		global.logger.trace(io.of('/').connected);
	});
}

