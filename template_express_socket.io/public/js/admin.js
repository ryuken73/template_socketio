// client code

$(document).ready(function(){
	var socket = io();
	handleConnect(socket);
})

	
function handleConnect(socket){
	socket.on('connect',function(){
		console.log('connected');
		$('#connection_status').text('connected');
		$('#connection_status').attr('class','connected');
	})
	handleDisconnect(socket);	
    handleSummaryRefesh(socket);
    handleDetailRefresh(socket);
}

function handleDisconnect(socket){
	socket.on('disconnect',function(){
		console.log('disconnected');
		$('#connection_status').text('disconnected');
		$('#connection_status').attr('class','disconnected');
	})
}

function handleDetailRefresh(socket){
	socket.on('adminDetail-server-to-client init',function(data){
		console.log('send req to server');
		socket.emit('client-to-server reqAllStatus');
	});
	
	socket.on('server-to-client resAllStatus', function(data){	
		console.log('got res from server');
		removeDetail(data);
		updateDetail(data);
		addDetail(data);
		socket.emit('client-to-server resAllStatusDone');	
	});
	
}

function removeDetail(data){

	var noData = _.reject($('.socket') ,function(element){
		var socketID = element.id;
		return _.some(data,['socketID',socketID]);
	})
	console.log(noData);
	
	_.forEach(noData, function(element){
		$('#' + element.id).remove();
	})		
	
}

 
function updateDetail(data){
	// update some rows which is in newly arrived data
	var updateData = _.filter(data, function(socket){
		var socketID = socket.socketID;
		return _.some($('.socket'),['id', socketID]);
	})
	updateData.forEach(function(socket){
		//console.log('update : ' + socket.socketID);
		var escapedID = socket.socketID.replace( /(:|\.|\/|\#|\-|\[|_|\]|,|=)/g, "\\$1" );
		console.log('escaped : ' + escapedID);
		$('#detail #'+escapedID+' #roomNM').text(socket.roomNM);
		$('#detail #'+escapedID+' #addr').text(socket.remoteAddr);
		$('#detail #'+escapedID+' #ctime').text(socket.clientTime);
		$('#detail #'+escapedID+' #stime').text(socket.serverTime);
		$('#detail #'+escapedID+' #offset').text(socket.tMonOffset);
		$('#detail #'+escapedID+' #status').text(socket.tMonStatus);		
	}) 		
}


function addDetail(data){
	
	var newData = _.filter(data, function(socket){
		var socketID = socket.socketID;
		return !(_.some($('.socket'),['id', socketID]));
	});
	//console.log(newData);
	newData.forEach(function(socket){
		console.log('append : ' + socket.socketID);
		var sockData = '<div id=' + socket.socketID + ' class = "row socket">';
		sockData    +=   '<div id=roomNM class="three columns">' + socket.roomNM + '</div>';
		sockData    +=   '<div id=addr class="two columns">' + socket.remoteAddr + '</div>';
		sockData    +=   '<div id=ctime class="two columns">' + socket.clientTime + '</div>';		
		sockData    +=   '<div id=stime class="two columns">' + socket.serverTime + '</div>';		
		sockData    +=   '<div id=offset class="two columns">' + socket.tMonOffset + '</div>';	
		sockData    +=   '<div id=status class="one columns">' + socket.tMonStatus + '</div>';			
		
		sockData     += '</div>  ';
		$('#detail').append(sockData); 
	
	});
	
}




function handleSummaryRefesh(socket){
	socket.on('adminSummary-server-to-client init',function(data){
		console.log('send req summary');
		socket.emit('client-to-server reqSummary');		
	});

	socket.on('server-to-client resSummary',function(data){		
		console.log('get res summary');
		removeData(data);
		updateData(data);
		addData(data);
		chgHeader(data);
		socket.emit('client-to-server resSummaryDone');

	})
}   

function removeData(data){
 
	// remove some previous rows which is not in newly arrived data 
	var noData = _.reject($('.group') ,function(element){
		var roomNM = element.id;
		return _.some(data,['roomNM',roomNM]);
	})

	_.forEach(noData, function(element){
		$('#' + element.id).remove();
	})
}

function addData(data){
	
	// add new rows which is newly included in arrived data
	var newData = _.filter(data, function(group){
		var roomNM = group.roomNM;
		return !(_.some($('.group'),['id', roomNM]));
		
	})
	newData.forEach(function(group){
		console.log('append : ' + group.roomNM);
		var statusHtml = mkSatusHtml(group.status);
		var rowData = '<div id=' + group.roomNM + ' class = "row group">'
		rowData     += '  <div id=groupNM class="three columns"><a href="/111">' + group.roomNM + '</a></div>'	
		//rowData     += '  <div id=groupNM class="three columns"><button class="button">' + group.roomNM + '</button></div>'
		rowData     += '  <div id=connected class = "three columns">' + group.connected + '</div>'	
		rowData     += '  <div id=status class = "three columns">' + statusHtml + '</div>'	
		rowData     += '</div>  ';
		$('#summary').append(rowData);
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

function updateData(data){
	// update some rows which is in newly arrived data
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