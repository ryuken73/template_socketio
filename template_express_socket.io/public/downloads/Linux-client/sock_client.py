# -*-coding: utf-8 -*-
'''
Usage :
'''
import configClass
import logging
from socketIO_client import SocketIO, BaseNamespace
import time
import sys
import signal
import platform


class Namespace(BaseNamespace):

    def setup_socket(self):
        client_time = time.time()
        #socketIO.emit('reqServerTime', {'clientTime': client_time})
        socketIO.on('joinResult', on_join_room)
        socketIO.on('request client time', on_req_time)
        socketIO.on('send server time', on_server_time)
        socketIO.on('setID', on_setid)

    def on_connect(self):
        print('[connected]')
        socketIO.emit('joinRoom', {'clientNM': 'testMachine1', 'roomNM': roomNM})
        self.setup_socket()

    def on_reconnect(self):
        print('[re-connected]')
        socketIO.emit('joinRoom', {'clientNM': 'testMachine1', 'roomNM': roomNM})
        self.setup_socket()

    def on_error(self, data):
        print('[error occur]', data)
        if data.lower() == 'invalid namespace':
            self._invalid = True


def on_join_room(*args):
    print('onJoinRoom', args)

def on_setid(*args):
    print('on_setid', args)
    global socket_id
    socket_id = args[0]['socketID']

def on_req_time() :
    client_time = long(time.time() * 1000)
    socketIO.emit('response client time', {'clientTime': client_time, 'socketID': socket_id, 'alias': alias})

def on_server_time(*args) :
    client_time = args[0]['clientTime']
    server_time = args[0]['serverTime']
    diff = server_time - client_time
    client_date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(client_time/1000))
    server_date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(server_time/1000))
    diff = server_time - client_time
    #print('local : ' + str(client_date) + ' remote : ' + str(server_date) + ' offset: ' + str(diff) + ' ms ')
    printLog('local : ' + str(client_date) + ' remote : ' + str(server_date) + ' offset: ' + str(diff) + ' ms ')
    socketIO.emit('receive server time')

def signal_handler(signal, frame) :
    sys.exit(0)

def printLog(logString) :
	if logging.upper() == 'ON' :
		print(logString)

logging.basicConfig(format='%(asctime)s %(levelname)s: %(message)s', level=logging.INFO)
if __name__ == '__main__':

    signal.signal(signal.SIGINT, signal_handler)

    try:
        logging.debug('this is main')
        rootLogger = logging.getLogger()

        config = configClass.ryuConfig('timeClient.cfg')
        config.setEssentialOption('host')
        config.setEssentialOption('port')
        config.setEssentialOption('roomNM')
        config.setOptionalOption('alias')
        config.setOptionalOption('logging')
        config.setOptionalOption('loglevel')


        for section in config.getOptions() :
                if section['name'] == 'timeMon' :
                        host = section['host']
                        port = section['port']
                        roomNM = section['roomNM']
                        logging = section['logging']
                        loglevel = section['loglevel']
                        alias = section['alias']
		print alias

		if not alias :
			print "alias not set"
			cfgFile = open('timeClient.cfg','w')
			alias = platform.node()
			config.config.set('timeMon','alias',alias)
			config.config.write(cfgFile)
			cfgFile.close()

        rootLogger.setLevel(loglevel)
        socketIO = SocketIO(host, port, Namespace)
        socketIO.wait()
    except KeyboardInterrupt :
        print 'Interrupted'
        sys.exit(0)