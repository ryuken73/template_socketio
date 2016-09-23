$(document).ready(function(){
	var socket = io();
	socket.emit('echo','ryuken ');	
})

