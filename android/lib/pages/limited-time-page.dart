// ignore_for_file: file_names, library_private_types_in_public_api

import 'dart:async';
import 'dart:typed_data';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:polydiff/components/chronometer-limited.dart';
import 'package:polydiff/components/message-sidebar.dart';
import 'package:polydiff/components/observer-area.dart';
import 'package:polydiff/components/play-area.dart';
import 'package:polydiff/components/popup-limited-end.dart';
import 'package:polydiff/pages/main-page.dart';
import 'package:polydiff/services/card-queue.dart';
import 'package:polydiff/services/communication.dart';
import 'package:polydiff/services/current-game.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/difference-detection-service.dart';
import 'package:polydiff/services/game-info.dart';
import 'package:polydiff/services/socket.dart';
import 'package:polydiff/services/user.dart';

enum TargetPlayer { player1, player2, player3, player4, all }

class LimitedTimePage extends StatefulWidget {
  @override
  _LimitedTimePageState createState() => _LimitedTimePageState();
}

class _LimitedTimePageState extends State<LimitedTimePage> {
  final GameInfoService gameInfo = GameInfoService();
  final DifferencesDetectionService differencesDetectionService =
      DifferencesDetectionService();
  final CommunicationService communicationService = CommunicationService();
  final CurrentGameService currentGame = CurrentGameService();
  late CardQueueService cardQueueService = CardQueueService();
  late AudioPlayer audioPlayer = AudioPlayer();

  late Timer _timer;

  late String username;
  String username2 = '';
  String username3 = '';
  String username4 = '';

  String winner = '';
  late int playerNumber;
  late List<String> playerNames;

  TargetPlayer _selectedPlayer = TargetPlayer.all;

  int _counter1 = 0;
  int _counter2 = 0;
  int _counter3 = 0;
  int _counter4 = 0;

  int tempsDebut = 120;
  int timeWon = 0;
  int maxTime = 120;
  bool cheatModeValid = false;

  final GlobalKey<CountdownState> _chronometerKey = GlobalKey<CountdownState>();

  bool leader = false;
  bool boolStartImage = false;
  bool gameEnded = false;
  String endingMessage = '';

  bool isObserver = false;
  Color colorObserver = Colors.red;
  late String observerName;
  int noOfObservers = 0;

  late Uint8List img1 = Uint8List(0);
  late Uint8List img2 = Uint8List(0);

  late StreamSubscription<Uint8List> _leftImageSubscription;
  late StreamSubscription<Uint8List> _rightImageSubscription;
  late StreamSubscription<List<Difference>> _differencesSubscription;
  bool isSubscribedEnd = false;
  // late StreamSubscription<List<String>> _playerNamesSubscription;
  // late StreamSubscription<int> _playerNumberSubsciption;
  late StreamSubscription<List<int>> _countSubscription;
  late StreamSubscription<String> _winnerSubscription;
  late StreamSubscription<List<bool>> _endGameSubscription;

  late StreamSubscription<int> _initialTimeGameSubscription;
  late StreamSubscription<int> _penaltyGameSubscription;
  late StreamSubscription<int> _timeWonGameSubscription;
  late StreamSubscription<bool> _cheatModeGameSubscription;
  late StreamSubscription<int> _maxTimeGameSubscription;

  //observer
  late StreamSubscription<dynamic> _observersSubscription;

  late List<Difference> diff = <Difference>[];

//observer
  String _targetPlayerToString(TargetPlayer targetPlayer) {
    switch (targetPlayer) {
      case TargetPlayer.player1:
        return "player1";
      case TargetPlayer.player2:
        return "player2";
      case TargetPlayer.player3:
        return "player3";
      case TargetPlayer.player4:
        return "player4";
      case TargetPlayer.all:
      default:
        return "all";
    }
  }

  

  @override
  void initState() {
    super.initState();
    gameInfo.playerCounts = [0, 0, 0, 0];
    username = User.username;

    _timer = Timer.periodic(Duration(seconds: 1), (Timer t) {
      // print('Timer: ${_chronometerKey.currentState?.remainingTime}');
      SocketService.socket.emit('updateTimer', null);
      if (_chronometerKey.currentState?.remainingTime == 0) {
        endGame(false);
        _showEndingPopUp();
        t.cancel(); // Cancel the timer once the game has ended
      }
    });

    // Observer
    SocketService.socket.on('updateObserversNumber', (data) {
      print('updateObserversNumber');
      if (data != null) {
        print('noOfObservers: $data');
        if (mounted) {
          setState(() {
            noOfObservers = data;
          });
        }
      }
    });


    if (gameInfo.isObserver == true) {
      print('IAMObserver'+gameInfo.isObserver.toString());
      isObserver = true;
      _observersSubscription =
          gameInfo.observerDataController.stream.listen((data) {
          print('Observer data: $data');
        if (data != null) {
          print('Observer data player names: ${data['players']}');
          colorObserver = _convertStringToColor(data['color']);
          observerName = data['observerName'];
          playerNames = List<String>.from(data['players']);
          if (mounted) {
            setState(() {
              username = gameInfo.playerNames.isNotEmpty  ? gameInfo.playerNames[1] : '';
              username2 = gameInfo.playerNames.length > 1 ? gameInfo.playerNames[1] : '';
              username3 = gameInfo.playerNames.length > 2 ? gameInfo.playerNames[2] : '';
              username4 = gameInfo.playerNames.length > 3 ? gameInfo.playerNames[3] : '';

              _counter1 = data['counters'][0];
              _counter2 = data['counters'][1];
              _counter3 = data['counters'][2];
              _counter4 = data['counters'][3];
            });
          }

         cardQueueService.setImages(data);  // 
        }
      });
    }

    playerNumber = gameInfo.playerNo;
    if (playerNumber == 0 && !gameInfo.isObserver) {
      print('Player number maybe called: $playerNumber');
      leader = true;
      if (!boolStartImage) {
        cardQueueService.getNext();
        boolStartImage = true;
      }
    }
    print('Player numberr: $playerNumber');

    //Update Timer
    SocketService.socket.on('updateTimer', (data) {
      print('updateTimer');
      if (data != null) {
        print('data: $data');
        _chronometerKey.currentState?.stopTimer();
        _chronometerKey.currentState?.startCountDownFrom(data);
      }
    });

    SocketService.socket.on('nextCardLimite', (data) {
      if (data != null &&
          data['card'] != null &&
          data['card']['differences'] != null &&
          data['card']['differences'].isNotEmpty) {
        print('nextCardLimite $data');
        List<dynamic> dynamicList = data['card']['differences'];
        List<Difference> differenceList =
            dynamicList.map((item) => Difference.fromJson(item)).toList();
        cardQueueService.differences.add(differenceList);
        // differences.add(data['card']['differences']);
        List<dynamic> dynamicRemovedDiff = data['remove'];
        cardQueueService.differenceRemovedList = dynamicRemovedDiff
            .map((item) => Difference.fromJson(item))
            .toList();
        cardQueueService.differencesRemoved
            .add(cardQueueService.differenceRemovedList);
        cardQueueService
            .setUpImage(data); // voir dowloadImage de gameCard pour images
      } else {
        print('data pas valide');
      }
    });

    SocketService.socket.on('requestTimerRedirection', (data) {
      print('requestTimerRedirection');
      if (data != null) {
        print('data: $data');
        final time = _chronometerKey.currentState?.remainingTime;
        SocketService.socket.emit('timerRedirection', {'timer': time});
      }
    });

    _endGameSubscription = currentGame.endGameStream.listen((endProps) {
      if (endProps[0]) {
        endGame(endProps[1]);
        _showEndingPopUp();
      }
    });

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _chronometerKey.currentState?.startCountDownFrom(gameInfo.initialTime);
    });

    currentGame.resetCounts();
    _countSubscription = currentGame.playerCountsStream.listen((playerCounts) {
      final arrayCounter = [_counter1, _counter2, _counter3, _counter4];
      if (mounted) {
        // setState(() {
        //   _counter1 = playerCounts.isNotEmpty ? playerCounts[0] : 0;
        //   _counter2 = playerCounts.length > 1 ? playerCounts[1] : 0;
        //   _counter3 = playerCounts.isNotEmpty ? playerCounts[2] : 0;
        //   _counter4 = playerCounts.length > 1 ? playerCounts[3] : 0;
        // });
      }
      if (arrayCounter[playerNumber] != playerCounts[playerNumber]) {
        if (_chronometerKey.currentState!.minutes * 60 +
                _chronometerKey.currentState!.seconds +
                10 >
            maxTime) {
          print('Temps max atteint');
          _chronometerKey.currentState?.startCountDownFrom(maxTime);
        } else {
          print('time added');
          _chronometerKey.currentState?.addTime(timeWon);
        }
      }
    });

    _winnerSubscription = currentGame.winnerStream.listen((winnerName) {
      if (winnerName != '') {
        print('Winner: $winnerName');
        if (mounted) {
          setState(() {
            winner = winnerName;
          });
        }
      }
    });
    cardQueueSetup();
    // gettingMissingValues();
    // emittingMissingValues();
  }

  void cardQueueSetup() {
    if (leader) {
      print('leader:  $leader');
      cardQueueService.getNext();
      boolStartImage = true;
    }

    _leftImageSubscription = cardQueueService.leftImage.stream.listen((x) {
      print('left image url subscription');
      final image1 = x;
      if (mounted) {
        if (image1.isNotEmpty) {
          setState(() {
            img1 = image1;
          });
        }
      }
    });

    _rightImageSubscription = cardQueueService.rightImage.stream.listen((x) {
      final image2 = x;
      if (mounted) {
        if (image2.isNotEmpty) {
          setState(() {
            img2 = image2;
          });
        }
      }
    });

    if (!isSubscribedEnd) {
      isSubscribedEnd = true;
      _differencesSubscription =
          cardQueueService.differences.stream.listen((x) {
        if (mounted) {
          print('differences in limitedTimePage: $x');
          if (x.isNotEmpty) {
            setState(() {
              diff = x;
              differencesDetectionService.setDifference(diff);
            });
          }
        }
      });
    }

    differencesDetectionService.foundStream.listen((event) {
      print('foundStream');
      if (leader) {
        cardQueueService.getNext();
      }
    });

    _initialTimeGameSubscription =
        gameInfo.initialTimeGameController.stream.listen((time) {
      print('initialTimeGameController');
      if (time != 0) {
        if (mounted) {
          setState(() {
            tempsDebut = time;
          });
        }
      }
      _chronometerKey.currentState?.startCountDownFrom(time);
    });

    _maxTimeGameSubscription =
        gameInfo.maxTimeGameController.stream.listen((time) {
      print('maxTimeGameController');
      if (time != 0) {
        if (mounted) {
          setState(() {
            maxTime = time;
          });
        }
      }
    });

    _timeWonGameSubscription =
        gameInfo.timeWonGameController.stream.listen((time) {
      print('timeWonGameController');
      if (time != 0) {
        if (mounted) {
          setState(() {
            timeWon = time;
          });
        }
      }
    });
  }

  void emittingMissingValues() {
    print('emittingMissingValues');
    SocketService.socket.emit('getNamesAndroid', null);
    SocketService.socket.emit('getConstantsAndroid', null);
  }

  void gettingMissingValues() {
    SocketService.socket.on(
        'returnNamesAndroid',
        (data) => {
              print('returnNamesAndroid: $data'),
              if (data != null)
                {
                  if (data['PlayersNames'].length > 0 && mounted)
                    {
                      setState(() {
                        username = data['PlayersNames'][0];
                        username2 =
                            data.length >= 1 ? data['PlayersNames'][1] : '';
                        username3 =
                            data.length >= 2 ? data['PlayersNames'][2] : '';
                        username4 =
                            data.length >= 3 ? data['PlayersNames'][3] : '';

                        print(
                            'username1: $username username2: $username2, username3: $username3, username4: $username4');
                      })
                    }
                }
            });

    SocketService.socket.on(
        'returnAndroidConstants',
        (data) => {
              if (data != null)
                {
                  print('returnConstantsAndroid: $data'),
                  if (data.length > 0 && mounted)
                    {
                      setState(() {
                        tempsDebut = data[0];
                        timeWon = data[1];
                        maxTime = data[2];
                        cheatModeValid = data[3];
                        _chronometerKey.currentState
                            ?.startCountDownFrom(tempsDebut);
                      })
                    }
                }
            });
  }

  @override
  Widget build(BuildContext context) {
    // gettingMissingValues();
    return Scaffold(
      body: Stack(
        children: [
          SafeArea(
            child: Column(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          children: [
                            Column(
                              children: [
                                Text(
                                    'Nom du joueur 1: ${gameInfo.playerNames.isNotEmpty ? gameInfo.playerNames[0] : ''}'),
                                Text(
                                    'Nombre de différences trouvées: ${gameInfo.playerCounts.isNotEmpty ? gameInfo.playerCounts[0] : 0}'),
                                // names.length > 1
                                Text(
                                    'Nom du joueur 2: ${gameInfo.playerNames.length > 1 ? gameInfo.playerNames[1] : ''}'),
                                // : Text(''),
                                Text(
                                    'Nombre de différences trouvées: ${gameInfo.playerCounts.length > 1 ? gameInfo.playerCounts[1] : 0}'),
                              ],
                            ),
                            Stack(
                              children: <Widget>[
                                IgnorePointer(
                                  ignoring: isObserver,
                                  child: PlayAreaWidget(
                                      img: img1,
                                      diff: diff as List<Difference>?,
                                      isObserver: isObserver,
                                      isReplay: false),
                                ),
                                IgnorePointer(
                                  ignoring:
                                      !isObserver, // Ignore touch events only when isObserver is false
                                  child: ObserverArea(
                                    isObserver: isObserver,
                                    observerColor: colorObserver,
                                    playerNumber:
                                        _targetPlayerToString(_selectedPlayer),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Column(
                        children: [
                          // Placeholder for logo
                          SizedBox(height: 10), // Adjust size accordingly
                          // Placeholder for GameInfo (You might need to create or adjust a widget for GameInfo)
                          // Adjust size accordingly
                          Countdown(
                            key: _chronometerKey,
                          )
                        ],
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Column(
                              children: [
                                Text(
                                    'Nom du joueur 3: ${gameInfo.playerNames.length > 2 ? gameInfo.playerNames[2] : ''}'),
                                Text(
                                    'Nombre de différences trouvées: ${gameInfo.playerCounts.length > 2 ? gameInfo.playerCounts[2] : 0}'),
                                // names.length > 1
                                Text(
                                    'Nom du joueur 3: ${gameInfo.playerNames.length > 3 ? gameInfo.playerNames[3] : ''}'),
                                // : Text(''),
                                Text(
                                    'Nombre de différences trouvées: ${gameInfo.playerCounts.length > 3 ? gameInfo.playerCounts[3] : 0}'),
                              ],
                            ),
                            Stack(
                              children: <Widget>[
                                IgnorePointer(
                                  ignoring: isObserver,
                                  child: PlayAreaWidget(
                                      img: img2,
                                      diff: diff as List<Difference>?,
                                      isObserver: isObserver,
                                      isReplay: false),
                                ),
                                IgnorePointer(
                                  ignoring:
                                      !isObserver, // Ignore touch events only when isObserver is false
                                  child: ObserverArea(
                                    isObserver: isObserver,
                                    observerColor: colorObserver,
                                    playerNumber:
                                        _targetPlayerToString(_selectedPlayer),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (isObserver)
                  Container(
                    width: MediaQuery.of(context).size.width * 0.2,
                    height: MediaQuery.of(context).size.height * 0.2,
                    child: _buildPlayerSelection(),
                  ),
                ElevatedButton(
                  onPressed: _showConfirmationDialog,
                  child: Text('Abandonner'),
                ),
              ],
            ),
          ),
          Align(
            alignment: Alignment.bottomRight,
            child: MessageSideBar(),
          ),
        ],
      ),
    );
  }

  // End Game
  void endGame(bool quit) async {
    print('here in endGame');
    gameEnded = true;
    final message = (_chronometerKey.currentState?.remainingTime == 0)
        ? 'Temps écoulé!'
        : 'Bravo vous avez complété toutes les fiches!';
    print('message: $message');
    setState(() {
      endingMessage = message;
    });
    SocketService.socket.emit('leaveGame', null);
    _chronometerKey.currentState?.stopTimer();
    // dispose();
  }

  void playErrorSound() async {
    print('playErrorSound');
    final String audioPath = User.specialErrorSoundUsed
        ? 'special-audios/fail-sound.mp3'
        : 'audios/error.mp3';
    await audioPlayer.play(AssetSource(audioPath));
  }

  void _showEndingPopUp() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return PopupEndingDialog(message: endingMessage);
      },
    );
  }

  @override
  void dispose() {
    cardQueueService.stopListening();
    gameInfo.dispose();
    currentGame.dispose();
    _differencesSubscription.cancel();
    _leftImageSubscription.cancel();
    _rightImageSubscription.cancel();
    _countSubscription.cancel();
    _winnerSubscription.cancel();
    _timer.cancel();
    _endGameSubscription.cancel();
    _initialTimeGameSubscription.cancel();
    _penaltyGameSubscription.cancel();
    _timeWonGameSubscription.cancel();
    _cheatModeGameSubscription.cancel();
    _maxTimeGameSubscription.cancel();
    super.dispose();
  }

  // observ er need to fix for color display ( pour les joeurs)
  Color _convertStringToColor(String colorString) {
    Color color;

    switch (colorString) {
      case 'red':
        color = Colors.red;
      case 'blue':
        color = Colors.blue;
      case 'green':
        color = Colors.green;
      default:
        color = Color.fromARGB(255, 188, 255, 62);
    }
    return color;
  }

  // Confirnation Dialog
  void _showConfirmationDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Confirmation'),
          content: Text('Êtes-vous sûr de vouloir quitter ?'),
          actions: [
            TextButton(
              onPressed: () {
                SocketService.socket.emit('leaveGameLimite', null);
                // currentGame.gameEnded(true, gameStats);
                Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => MainPage(),
                ));
              },
              child: Text('Oui'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text('Non'),
            ),
          ],
        );
      },
    );
  }

  Widget _buildPlayerSelection() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        _buildPlayerRadioListTile(TargetPlayer.player1, "joueur 1"),
        _buildPlayerRadioListTile(TargetPlayer.player2, "joueur 2"),
        _buildPlayerRadioListTile(TargetPlayer.player3, "joueur 3"),
        _buildPlayerRadioListTile(TargetPlayer.player4, "joueur 4"),
        _buildPlayerRadioListTile(TargetPlayer.all, "tous les joueurs "),
      ],
    );
  }

  Widget _buildPlayerRadioListTile(TargetPlayer player, String title) {
    return Container(
      height: 25,
      child: ListTile(
        dense: true,
        title: Text(
          title,
          style: TextStyle(fontSize: 12),
        ),
        leading: Radio<TargetPlayer>(
          value: player,
          groupValue: _selectedPlayer,
          onChanged: (TargetPlayer? value) {
            setState(() {
              _selectedPlayer = value!;
            });
          },
        ),
      ),
    );
  }
}
