var _ = require('lodash');
var Q = require('q');
var dateUtil = require('../lib/dateToString');
var adminSummary = require('../lib/adminSummary');
var adminDetail = require('../lib/adminDetail');

module.exports = function(socket, io){
	 
	adminSummary(socket,io);
	adminDetail(socket,io);

 }

