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
		removeData(data);
		updateData(data);
		addData(data);
		chgHeader(data);
		socket.emit('client-to-server resDone');

	})
}   

function removeData(data){

	var noData = _.reject($('.group') ,function(element){
		var roomNM = element.id;
		return _.some(data,['roomNM',roomNM]);
	})

	_.forEach(noData, function(element){
		$('#' + element.id).remove();
	})
}

function addData(data){
	var newData = _.filter(data, function(group){
		var roomNM = group.roomNM;
		return !(_.some($('.group'),['id', roomNM]));
		
	})
	newData.forEach(function(group){
		console.log('append : ' + group.roomNM);
		var statusHtml = mkSatusHtml(group.status);
		var rowData = '<div id=' + group.roomNM + ' class = "row group">'
		//rowData     += '  <div id=groupNM class="three columns"><a href="/111">' + group.roomNM + '</a></div>'	
		rowData     += '  <div id=groupNM class="three columns"><button class="button">' + group.roomNM + '</button></div>'
		rowData     += '  <div id=connected class = "three columns">' + group.connected + '</div>'	
		rowData     += '  <div id=status class = "three columns">' + statusHtml + '</div>'	
		rowData     += '</div>  ';
		$('#summary').append(rowData);
	})
}

function updateData(data){
	var updateData = _.filter(data, function(group){
		var roomNM = group.roomNM;
		return _.some($('.group'),['id', roomNM]);
	})
	updateData.forEach(function(group){
		console.log('update : ' + group.roomNM);
		var statusHtml = mkSatusHtml(group.status);
		$('#summary #'+group.roomNM+' #connected').text(group.connected);
		$('#summary #'+group.roomNM+' #status').html(statusHtml);
		
	}) 
}

function mkSatusHtml(status){
	var numGood = status.GOOD ? status.GOOD:0;
	var numWarn = status.WARN ? status.WARN:0;
	var numFail = status.FAIL ? status.FAIL:0;
	
	var good = '<span class="good">Good:' + numGood + ' </span>';
	var warn = '<span class="warn">Warn:' + numWarn + ' </span>';
	var fail = '<span class="fail">Fail:' + numFail + ' </span>';
	return good + ' / ' + warn + ' / ' + fail;
}

function chgHeader(data){
	// change total Connected
	var connected = _.reduce(data, function(result,value,key,collection){
		return result + value.connected	
	},0);
	$('#connected').text(connected);
	// change last update time
	var date = new Date();
	$('#lastUpdated').text(date);
	
}