// client code

$(document).ready(function(){
	var socket = io();
	handleConnect(socket);
})

	
function handleConnect(socket){
	socket.on('connect',function(){
		console.log('connected');
		handleDisconnect(socket);
        handleRefesh(socket)
	})
}

function handleDisconnect(socket){
	socket.on('disconnect',function(){
		console.log('disconnected');
	})
}

function handleRefesh(socket){
	socket.on('server-to-client init',function(data){
		socket.emit('client-to-server reqStatus');		
	});
	
	socket.on('server-to-client resStatus',function(data){
		console.log(data.root[0].tMonStatus);
		socket.emit('client-to-server resDone');
		$('#addr').text(data.root[0].remoteAddr);
		$('#clientTime').text(data.root[0].clientTime);
		$('#serverTime').text(data.root[0].serverTime);
		$('#offset').text(data.root[0].tMonOffset);
		$('#state').text(data.root[0].tMonStatus);

	})
}   