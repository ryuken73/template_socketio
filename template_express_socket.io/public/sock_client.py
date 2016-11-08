from socketIO_client import SocketIO, BaseNamespace
import time


class Namespace(BaseNamespace):
    def setup_socket(self):
        client_time = time.time()
        socketIO.emit('reqServerTime', {'clientTime': client_time})
        socketIO.on('joinResult', on_join_room)
        socketIO.on('request client time', on_req_time)
        socketIO.on('send server time', on_server_time)
        socketIO.on('resServerTime', on_rcv_time)
        socketIO.on('setID', on_setid)

    def on_connect(self):
        print('[connected]')
        socketIO.emit('joinRoom', {'clientNM': 'testMachine1', 'roomNM': 'ryu'})
        self.setup_socket()

    def on_reconnect(self):
        print('[re-connected]')
        socketIO.emit('joinRoom', {'clientNM': 'testMachine1', 'roomNM': 'ryu'})
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
    socketIO.emit('response client time', {'clientTime': client_time, 'socketID': socket_id})

def on_server_time(*args) :
    client_time = args[0]['clientTime']
    server_time = args[0]['serverTime']
    diff = server_time - client_time
    client_date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(client_time/1000))
    server_date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(server_time/1000))
    diff = server_time - client_time
    print('local time: ' + str(client_date) + ' remote time: ' + str(server_date) + ' offset: ' + str(diff) + ' ms ' + socket_id)
    socketIO.emit('receive server time')


def on_rcv_time(*args):
    client_time = long(time.time()*1000)
    server_time = args[0]['serverTime']
    diff = server_time - client_time
    client_date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(client_time/1000))
    server_date = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(server_time/1000))
    diff = server_time - client_time
    print('local time: ' + str(client_date) + ' remote time: ' + str(server_date) + ' offset: ' + str(diff) + ' ms ' + socket_id)
    time.sleep(1)
    socketIO.emit('reqServerTime', {'clientNM': 'testMachine1', 'clientTime': client_time, 'socketID': socket_id})


if __name__ == '__main__':
    socketIO = SocketIO('localhost', 3001, Namespace)
    socketIO.wait()


