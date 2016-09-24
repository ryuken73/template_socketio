$(document).ready(function(){
	var socket = io();
	handleConnect(socket);
	
	function getEpochTime(){
		var date = new Date();
		return date.getTime();
	}
	function epochToDateObj(time){
		var date = new Date(time);
		return date;
	}
	
})


function handleConnect(socket){
	socket.on('connect',function(){
		console.log('connected');
	})
	socket.on('setID',function(data){
		socketID = data.socketID;
		handleRoom(socket);
		handleDisconnect(socket);
		//handleConnectError(socket);
		//handleConnectTimeout(socket);
		//handleReconnecting(socket);		
	})
}

function handleDisconnect(socket){
	socket.on('disconnect',function(){
		console.log('disconnected');
	})
}

function handleRoom(socket){
	var room = location.pathname.split('/')[1] ? location.pathname.split('/')[1]:'root';
	console.log('joinRoom : ' + room + ' : ' + socketID);
	socket.emit('joinRoom',{ roomNM : room });
	socket.on('joinResult',function(data){
		console.log('node joined : ' + data.ip);
		// refresh node list : IP address
	});   
}
