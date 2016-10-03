// client code

$(document).ready(function(){
	var socket = io();
	handleConnect(socket);
})

	
function handleConnect(socket){
	socket.on('connect',function(){
		console.log('connected');
		handleDisconnect(socket);
        handleInit(socket)
	})
}

function handleDisconnect(socket){
	socket.on('disconnect',function(){
		console.log('disconnected');
	})
}

function handleInit(socket){
	socket.emit('adminInit');
}