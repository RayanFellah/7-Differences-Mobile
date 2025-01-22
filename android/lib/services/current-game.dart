import 'dart:async';

import 'package:polydiff/services/click-history.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/interfaces/gameStats.dart';
import 'package:polydiff/services/replay-service.dart';
import 'package:polydiff/services/socket.dart';

// Assuming you will add ReplayService later
// import 'package:your_package/replay_service.dart';

class CurrentGameService {
  List<int> _playerCounts = [];
  List<String> _playerNames = [];
  List<Difference> _diffArray = [];
  List<bool> endGame = [false, false];
  String winner = '';
  bool _leader = false;

  final SocketService _socketService;
  final _destroyController = StreamController<void>.broadcast();
  final List<StreamSubscription> _subscriptions = [];
  final ReplayService replayService = ReplayService();

  StreamController<List<int>> _playerCountsController =
      StreamController<List<int>>.broadcast();
  StreamController<List<Difference>> _diffArrayController =
      StreamController<List<Difference>>.broadcast();
  StreamController<List<bool>> _endGameController =
      StreamController<List<bool>>.broadcast();
  StreamController<String> _winnerController =
      StreamController<String>.broadcast();
  StreamController<bool> _leaderController = StreamController<bool>.broadcast();

  static final CurrentGameService _instance =
      CurrentGameService._internal(SocketService());

  factory CurrentGameService() => _instance;

  CurrentGameService._internal(this._socketService) {
    print(
        '${ClickHistoryServiceDart.timeFraction} timeFraction CurrentGameService');
    initializeListeners();
  }

  void initializeListeners() {
    // _manageStream(_socketService.listen('leader'), (res) {
    //   _leader = true;
    //   _leaderController.add(_leader);
    // });
    SocketService.socket.on('leader', (res) {
      _leader = true;
      _leaderController.add(_leader);
    });

    SocketService.socket.on('diffFound', (res) {
      print('here in diffFound');
      if (res != null && res['counters'] != null) {
        List<int> newCounts = List<int>.from(res['counters']);
        print('$newCounts newCounts');
        // Mettez à jour les compteurs des joueurs avec les nouvelles valeurs
        replayService.addCounterEventReplay(newCounts);
        _playerCounts = newCounts;
        // Notifiez les écouteurs du stream des compteurs des joueurs avec les nouvelles valeurs
        _playerCountsController.add(_playerCounts);
        print('Updated player counts: $_playerCounts');
      }
    });

    _manageStream(_socketService.listen('End'), (res) {
      try {
        winner = res['winner'];
      } catch (e) {
        winner = res;
      }
      _winnerController.add(winner);
      endGame = [true, false];
      _endGameController.add(endGame);
      print('ended $res');
    });

    _manageStream(_socketService.listen("otherPlayerQuit"), (_) {
      print('otherPlayerQuit');
      winner = _playerNames.isNotEmpty ? _playerNames[0] : '';
      _winnerController.add(winner);
      endGame = [true, true];
      _endGameController.add(endGame);
    });
  }

  void _manageStream(Stream stream, Function(dynamic) onData) {
    var subscription = stream.listen(onData);
    _subscriptions.add(subscription);
    _destroyController.stream.listen((_) => subscription.cancel());
  }

  void increment(int playerIndex) {
    if (playerIndex < _playerCounts.length) {
      _playerCounts[playerIndex]++;
      _playerCountsController.add(_playerCounts);
    }
  }

  void emitMoney(dynamic data) {
    SocketService.socket.emit('endMoney', data);
  }

  void resetCounts() {
    _playerCounts = List<int>.filled(_playerNames.length, 0);
    _playerCountsController.add(_playerCounts);
  }

  void gameEnded(bool quit, GameStats gameStats) {
    print('gameEnded $gameStats');
    _socketService
        .emit("gameEnded", {'quit': quit, 'gameStats': gameStats.toJson()});
  }

  Stream<List<int>> get playerCountsStream => _playerCountsController.stream;
  Stream<List<Difference>> get diffArrayStream => _diffArrayController.stream;
  Stream<List<bool>> get endGameStream => _endGameController.stream;
  Stream<String> get winnerStream => _winnerController.stream;
  Stream<bool> get leaderStream => _leaderController.stream;

  void dispose() {
    _playerCounts = [];
    _destroyController.close();
    _playerCountsController.close();
    _diffArrayController.close();
    _endGameController.close();
    _winnerController.close();
    _leaderController.close();
    _subscriptions.forEach((subscription) => subscription.cancel());
    // distroy Socket
    replayService.dispose();
    print(
        '${ClickHistoryServiceDart.timeFraction} timeFraction CurrentGameService dispose');
  }
}
