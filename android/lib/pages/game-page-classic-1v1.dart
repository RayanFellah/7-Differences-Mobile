// ignore_for_file: unnecessary_brace_in_string_interps

import 'dart:async';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:polydiff/components/chronometer-limited.dart';
import 'package:polydiff/components/counter.dart';
import 'package:polydiff/components/message-sidebar.dart';
import 'package:polydiff/components/play-area.dart';
import 'package:polydiff/pages/main-page.dart';
import 'package:polydiff/pages/replay-page.dart';
import 'package:polydiff/services/blinker.dart';
import 'package:polydiff/services/click-history.dart';
import 'package:polydiff/services/current-game.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/difference-detection-service.dart';
import 'package:polydiff/services/game-info.dart';
import 'package:polydiff/services/image-transfer.dart';
import 'package:polydiff/services/image-update.dart';
import 'package:polydiff/services/interfaces/gameStats.dart';
import 'package:polydiff/services/items.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/replay-service.dart';
import 'package:polydiff/services/socket.dart';
import 'package:polydiff/services/user.dart';
// Autres imports nécessaires...

class GamePageClassic1v1 extends StatefulWidget {
  // final String link1;
  // final String link2;
  final Uint8List img1;
  Uint8List img2;
  List<Difference>? diff;
  bool isReplay;

  //global key for the 2 play area

  final GlobalKey<PlayAreaWidgetState> playArea1Key = GlobalKey();
  final GlobalKey<PlayAreaWidgetState> playArea2Key = GlobalKey();

  //use global key for the 4 counters

  final GlobalKey<CounterState> counter1Key = GlobalKey();
  final GlobalKey<CounterState> counter2Key = GlobalKey();
  final GlobalKey<CounterState> counter3Key = GlobalKey();
  final GlobalKey<CounterState> counter4Key = GlobalKey();

  final GlobalKey<CountdownState> chronometerKey = GlobalKey<CountdownState>();

  GamePageClassic1v1(
      {Key? key,
      required this.img1,
      required this.img2,
      this.diff,
      this.isReplay = false})
      : super(key: key);

  @override
  GamePageClassic1v1State createState() => GamePageClassic1v1State();
}

class GamePageClassic1v1State extends State<GamePageClassic1v1> {
  // Services
  final ImageTransferService imageTransfer = ImageTransferService();
  final ItemService itemService = ItemService();
  final GameInfoService gameInfo = GameInfoService();
  final DifferencesDetectionService differencesDetectionService =
      DifferencesDetectionService();
  final ImageUpdateService imageUpdateService = ImageUpdateService();
  final BlinkerService blinker = BlinkerService();
  // final CheatModeService cheatModeService = CheatModeService();
  final CurrentGameService currentGameService = CurrentGameService();
  final LanguageService languageService = LanguageService();
  // final GameHistoryService gameHistoryService = GameHistoryService();
  final ReplayService replayService = ReplayService();

  late StreamSubscription<List<Difference>?> _foundDiffSubscription;
  late StreamSubscription<List<int>> _countSubscription;
  late StreamSubscription<List<Difference>?>? _diffSubscription;
  late StreamSubscription<List<String>> _playerNamesSubscription;
  late StreamSubscription<List<bool>> _endGameSubscription;

  late Uint8List img1Debut;
  late Uint8List img2Debut;
  late List<Difference>? diffDebut;
  // int _foundDifferencesCount = 0;
  String _playerName = '';
  // Variables d'état
  String username = "";
  String username2 = "";
  String username3 = "";
  String username4 = "";
  String link1 = "";
  String link2 = "";
  bool wantToQuit = false;
  bool gameEnded = false;
  List<Difference>? diff;

  int moneyWon = 0;

  bool hasGameMuliplier = false;

  int _counter1 = 0;
  int _counter2 = 0;
  int _counter3 = 0;
  int _counter4 = 0;

  late int playerNumber;
  late List<String> playerNames;

  bool hasEmittedMoney = false;

  Timer? _timer;

  Uint8List? _updatedImg2;

  void onContinue() {
    // TODO: OBSERVER FOR CLASSIC
    print('leaving game multi');
    SocketService.socket
        .emit('leaveGameMulti', {'observer': false, 'observerName': ''});
  }

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
                onContinue();
                currentGameService.gameEnded(true, gameEndData());
                Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => MainPage(),
                ));
              },
              child: Text('Oui'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).push(MaterialPageRoute(
                  builder: (context) => MainPage(),
                ));
              },
              child: Text('Non'),
            ),
          ],
        );
      },
    );
  }

  GameStats gameEndData() {
    int noOfPlayers = playerNames.length;

    // Créez dynamiquement la liste des joueurs et leurs scores basés sur le nombre de joueurs
    List<dynamic> players = [];
    int highestScore = -1;
    dynamic winner;

    for (int i = 0; i < noOfPlayers; i++) {
      String username = '';
      switch (i) {
        case 0:
          username = playerNames[0];
          break;
        case 1:
          username = playerNames[1];
          break;
        case 2:
          username = playerNames[2];
          break;
        case 3:
          username = playerNames[3];
          break;
      }
      int score = gameInfo.playerCounts[i];

      // Déterminez le gagnant
      if (score > highestScore) {
        highestScore = score;
        winner = {'username': username, 'score': score};
      }

      // Ajoutez l'objet joueur dans le tableau
      players.add({'username': score});
    }

    Map<String, dynamic> gameStatsMap = {
      'players': players,
      'winner': winner, // Add the winner here
      'gameTime': widget.chronometerKey.currentState?.seconds ?? 0,
    };

// Convert the map to a GameStats object
    GameStats gameStats = GameStats.fromMap(gameStatsMap);

    return gameStats;
  }

  void getHasPointsMultiplier() async {
    var items = await itemService.getBoughtItems(User.username);
    hasGameMuliplier =
        items.where((e) => e.type == 'Multiplicateur x2').toList().isNotEmpty;
  }

  @override
  void initState() {
    print(
        '${ClickHistoryServiceDart.timeFraction} timeFraction in game page 1v1');
    img1Debut = widget.img1;
    img2Debut = widget.img2;
    diffDebut = widget.diff;
    super.initState();
    initialiseGame();
    replayService.restartTimer();

    _timer = Timer.periodic(Duration(seconds: 1), (Timer t) {
      // print('Timer: ${_chronometerKey.currentState?.remainingTime}');
      if (widget.chronometerKey.currentState?.remainingTime == 0) {
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              title: Text('Fin du jeu'),
              content: Text('Le vainqueur est : ' + currentGameService.winner),
              actions: <Widget>[
                TextButton(
                  child: Text('Retour à la page de sélection'),
                  onPressed: () {
                    onContinue();
                    widget.chronometerKey.currentState?.start = 120;
                    currentGameService.gameEnded(true, gameEndData());
                    gameInfo.playerCounts = [0, 0, 0, 0];
                    Navigator.of(context).push(MaterialPageRoute(
                      builder: (context) => MainPage(),
                    ));
                  },
                ),
              ],
            );
          },
        );
        t.cancel(); // Cancel the timer once the game has ended
      }
    });

    // Listen to differences found and update UI

    playerNumber = gameInfo.playerNo;
    playerNames = gameInfo.playerNames;

    _foundDiffSubscription =
        differencesDetectionService.foundStream.listen((foundDiffs) async {
      print('Found differences: ${foundDiffs}');
      final updatedImage = await imageUpdateService.updateImage(
          foundDiffs, widget.img1, widget.img2);
      if (mounted) {
        setState(() {
          widget.img2 = updatedImage;
        });
      }
    });

    _diffSubscription =
        differencesDetectionService.differenceStream.listen((diffs) {
      print('Differences: ${diffs}');
      if (mounted) {
        setState(() {
          widget.diff = diffs;
        });
      }
    });

    // Listen to player counts updates and update UI
    // _countSubscription =
    //     currentGameService.playerCountsStream.listen((playerCounts) {
    //   if (mounted) {
    //     setState(() {
    //       _counter1 = playerCounts.isNotEmpty ? playerCounts[0] : 0;
    //       _counter2 = playerCounts.length > 1 ? playerCounts[1] : 0;
    //       _counter3 = playerCounts.length > 2 ? playerCounts[2] : 0;
    //       _counter4 = playerCounts.length > 3 ? playerCounts[3] : 0;
    //     });
    //   }
    // });

    _foundDiffSubscription =
        currentGameService.diffArrayStream.listen((diffArray) {
      setState(() {
        differencesDetectionService
            .setDifference(widget.diff as List<Difference>?);
        imageUpdateService.updateImage(diffArray, widget.img1, widget.img2);
      });
    });

    _endGameSubscription = currentGameService.endGameStream.listen((endGame) {
      if (!hasEmittedMoney) {
        print('emit money');
        moneyWon = currentGameService.winner == User.username ? 5 : 1;
        moneyWon = hasGameMuliplier ? this.moneyWon * 2 : this.moneyWon;
        final newDinars = User.dinarsAmount + moneyWon;
        this
            .currentGameService
            .emitMoney({'username': User.username, 'money': newDinars});
        hasEmittedMoney = true;
        User.dinarsAmount = newDinars;
      }
      if (mounted) {
        setState(() {
          gameEnded = endGame[0] ?? false;
          if (gameEnded) {
            widget.chronometerKey.currentState?.stopTimer();

            replayService.addEndGameEventReplay();
            replayService.dispose();
            showDialog(
              context: context,
              builder: (BuildContext context) {
                return AlertDialog(
                  title: Text('Fin du jeu'),
                  content: Text('Le vainqueur est : ' +
                      currentGameService.winner +
                      ' Vous avez gagné ' +
                      moneyWon.toString() +
                      ' dinars'),
                  actions: <Widget>[
                    TextButton(
                      child: Text(
                        'Retour à la page de sélection',
                        textAlign: TextAlign.end,
                      ),
                      onPressed: () {
                        onContinue();
                        widget.chronometerKey.currentState?.start = 120;
                        gameInfo.playerCounts = [0, 0, 0, 0];
                        currentGameService.gameEnded(true, gameEndData());
                        Navigator.of(context).push(MaterialPageRoute(
                          builder: (context) => MainPage(),
                        ));
                      },
                    ),
                    TextButton(
                      child: Text(languageService.translate(
                          frenchString: 'Visionner', englishString: 'Replay')),
                      onPressed: () async {
                        gameInfo.playerCounts = [0, 0, 0, 0];
                        currentGameService.resetCounts();
                        _endGameSubscription.cancel();

                        Navigator.of(context).push(MaterialPageRoute(
                            builder: (context) => ReplayPage(
                                img1: img1Debut,
                                img2: img2Debut,
                                diff: diffDebut)));
                      },
                    )
                  ],
                );
              },
            );
          }
        });
      }
    });
    print('chronometerKey.currentState; ${widget.chronometerKey.currentState}');
    WidgetsBinding.instance.addPostFrameCallback((_) {
      widget.chronometerKey.currentState
          ?.startCountDownFrom(gameInfo.initialTime);
    });
  }

  Future<ui.Image> _convertToUiImage(Uint8List imgBytes) async {
    final Completer<ui.Image> completer = Completer();
    ui.decodeImageFromList(imgBytes, (ui.Image img) {
      return completer.complete(img);
    });
    return completer.future;
  }

  void initialiseGame() {}

  @override
  void dispose() {
    print('dispose of game page 1v1');
    gameInfo.playerCounts = [0, 0, 0, 0];
    gameInfo.playerNames = ['', '', '', ''];
    widget.chronometerKey.currentState?.start = 120;
    widget.chronometerKey.currentState?.stopTimer();
    print(
        '${ClickHistoryServiceDart.timeFraction} timeFraction in game page 1v1 dispose');
    currentGameService.resetCounts();
    _foundDiffSubscription.cancel();
    // _countSubscription.cancel();
    _endGameSubscription.cancel();
    _diffSubscription?.cancel();
    // _playerNamesSubscription.cancel();
    _diffSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
                            Counter(
                                key: widget.counter1Key,
                                name: playerNames.isNotEmpty
                                    ? playerNames[0]
                                    : 'Joueur 1',
                                counter: gameInfo.playerCounts.isNotEmpty
                                    ? gameInfo.playerCounts[0]
                                    : 0),
                            Counter(
                                key: widget.counter2Key,
                                name: playerNames.length > 1
                                    ? playerNames[1]
                                    : 'Joueur 2',
                                counter: gameInfo.playerCounts.length > 1
                                    ? gameInfo.playerCounts[1]
                                    : 0), // Import the correct file for the Difference class
                            PlayAreaWidget(
                              key: widget.playArea1Key,
                              img: widget.img1,
                              diff: widget.diff as List<Difference>?,
                              isReplay: widget.isReplay,
                            ),
                          ],
                        ),
                      ),
                      Column(
                        children: [
                          // Placeholder for logo
                          SizedBox(height: 60), // Adjust size accordingly
                          // Placeholder for GameInfo (You might need to create or adjust a widget for GameInfo)
                          SizedBox(height: 20),
                          Countdown(key: widget.chronometerKey),
                        ],
                      ),
                      Expanded(
                        child: Column(
                          children: [
                            Counter(
                                key: widget.counter3Key,
                                name: playerNames.length > 2
                                    ? playerNames[2]
                                    : '',
                                counter: gameInfo.playerCounts.length > 2
                                    ? gameInfo.playerCounts[2]
                                    : 0),
                            Counter(
                                key: widget.counter4Key,
                                name: playerNames.length > 3
                                    ? playerNames[3]
                                    : '',
                                counter: gameInfo.playerCounts.length > 3
                                    ? gameInfo.playerCounts[3]
                                    : 0),
                            PlayAreaWidget(
                              key: widget.playArea2Key,
                              img: widget.img2,
                              diff: widget.diff as List<Difference>?,
                              isReplay: widget.isReplay,
                            ), // Import the correct file for the Difference class
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                if (!widget.isReplay) ...[
                  ElevatedButton(
                    onPressed: _showConfirmationDialog,
                    child: Text('Abandonner'),
                  ),
                ]
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
}
