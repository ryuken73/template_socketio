/**
 * New node file
 */

exports.bind = function(io){
	io.on('connection',function(socket){
		console.log('conn');		
		handlerEcho(socket);
	});
};

function handlerEcho(socket){
	socket.on('echo',function(data){
		global.logger.info('called echo from %s', data);
	})
}