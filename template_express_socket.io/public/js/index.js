// client code

$(document).ready(function(){
	var socket = io();
	handleConnect(socket);
	haneleTime(socket);
})

	
function getEpochTime(){
	var date = new Date();
	return date.getTime();
}

function epochToDateObj(time){
	var date = new Date(time);
	return date;
}


function handleConnect(socket){
	socket.on('connect',function(){
		console.log('connected');
		$('#connection_status').text('connected');
		$('.row').attr('class','row enabled');
		$('#connection_status').attr('class','connected');
	})
	socket.on('setID',function(data){
		console.log(data);
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
		$('#connection_status').text('disconnected');
		$('.row').attr('class','row disabled');
		$('#connection_status').attr('class','disconnected');
	})
}

function handleRoom(socket){
	var room = location.pathname.split('/')[1] ? location.pathname.split('/')[1]:'root';
	console.log('joinRoom : ' + room + ' : ' + socketID);
	socket.emit('joinRoom',{ roomNM : room });
	socket.on('joinResult',function(data){
		console.log('node joined : ' + data.ip);
		//TODO :  refresh same room member list : IP address
	});   
}

function haneleTime(socket){
	
	socket.on('request client time',function(){
		console.log('receive request client time');
		var clientTime = getEpochTime();
		var alias = $('#alias').val() ? $('#alias').val() : "none";
		socket.emit('response client time', {clientTime:clientTime, socketID:socketID, alias:alias});		
	})
	
	socket.on('send server time', function(data){
		console.log(data.clientTime);
		console.log(data.serverTime);
		var clientDate = epochToDateObj(data.clientTime);
		var serverDate = epochToDateObj(data.serverTime);
		//console.log(clientDate);
		//console.log(serverDate);
		$('#local').text(clientDate);
		$('#remote').text(serverDate);
		$('#offset').text(data.clientTime - data.serverTime);	
		socket.emit('receive server time');
		
	})

}
