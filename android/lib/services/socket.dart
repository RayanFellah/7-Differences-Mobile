import 'dart:async';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

class SocketService {
  static Timer? _timer;

  static final socket =
      IO.io(dotenv.env['SERVER_URL_AND_PORT'], <String, dynamic>{
    'autoConnect': false,
    'transports': ['websocket'],
  });
  static initSocket() {
    socket.connect();
    socket.onConnect((_) {
      print('SocketIO : connection established');
      print(socket.id);
    });
    socket.onConnectError((err) => print(err));
    socket.onDisconnect((data) {
        print('Disconnected socket. Reason: $data');
    });

    socket.onError((error) {
      print('Error occurred: $error');
    });

    print(socket.id);
  }

  static void startConnectionPing() {
    Timer.periodic(Duration(seconds: 10), (Timer t) {
      socket.emit('updateLastPing');
    });
  }

  static void stopConnectionPing() {
    if (_timer != null) {
      _timer?.cancel();
      _timer = null;
      print('Ping stopped');
    }
  }

  static void resetSocket() {
    socket.disconnect();
    socket.connect();
  }

  Stream<dynamic> listen(String event) {
    final StreamController<dynamic> controller =
        StreamController<dynamic>.broadcast();

    socket.on(event, (data) {
      controller.add(data);
    });

    return controller.stream;
  }

  void emit(String event, dynamic data) {
    print('trying to emit ' + event + ' with data ' + data.toString());
    socket.emit(event, data);
  }

  void dispose() {
    socket.dispose();
  }
}
