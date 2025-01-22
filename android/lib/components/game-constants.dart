// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:polydiff/components/waiting-page-limite.dart';
import 'package:polydiff/interfaces/game-access-type.dart';
import 'package:polydiff/services/consts.dart';
import 'package:polydiff/services/game-constants-service.dart';
import 'package:polydiff/services/interfaces/game-consts-interface.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/socket.dart';
import 'package:polydiff/services/user.dart';

class GameConstantsScreen extends StatefulWidget {
  late GameAccessType gameAccessType;

// constructor with type GameAccessType
  GameConstantsScreen({Key? key, required this.gameAccessType})
      : super(key: key);

  @override
  _GameConstantsScreenState createState() => _GameConstantsScreenState();
}

class _GameConstantsScreenState extends State<GameConstantsScreen> {
  int initialTime = Consts.DEFAULT_INITIAL_TIME;
  int penalty = Consts.DEFAULT_TIME_WON;
  int timeWon = Consts.DEFAULT_PENALTY;
  late bool cheatMode = Consts.DEFAULT_CHEAT_MODE;
  int maxTime = 120;

  String username = '';

  final GameConstantsService gameConstantsService = GameConstantsService();

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    username = User.username;
    initialize();
  }

  void initialize() async {
    Constants constants = gameConstantsService.getConstants();
    setState(() {
      initialTime = constants.initialTime;
      penalty = constants.penalty;
      timeWon = constants.timeWon;
      cheatMode = constants.cheatMode;
    });
  }

  void setConstants() async {
    Constants constants = Constants(
      initialTime: initialTime,
      penalty: penalty,
      timeWon: timeWon,
      cheatMode: cheatMode,
    );
    await gameConstantsService.setConstants(constants);
    createLobby(widget.gameAccessType);
  }

  // void createLobby(GameAccessType gameAccessType) {
  //   print('Creating lobby');
  //   SocketService.socket.emit('createGameLimite',
  //       {'username': username, 'gameAccessType': gameAccessType.index});
  //   Navigator.push(
  //     context,
  //     MaterialPageRoute(
  //       builder: (context) => WaintingPageLimite(), // change to waiting page
  //     ),
  //   );
  // }
  void createLobby(GameAccessType gameAccessType) {
    print('Creating lobby');
    SocketService.socket.emit('createGameLimite', {
      'username': username,
      'gameAccessType': gameAccessType.index,
      'isObserver': false,
      'initialTime': initialTime,
      'penalty': penalty,
      'timeWon': timeWon,
      'cheatMode': cheatMode,
      'maxTime': maxTime
    });
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WaintingPageLimite(), // change to waiting page
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(
        LanguageService().translate(
          frenchString: 'Paramètres de la partie',
          englishString: 'Game settings',
        ),
        ),
         actions: [
        ElevatedButton(
          onPressed: setConstants,
          child: Text(
            LanguageService().translate(
              frenchString: 'Confirmer',
              englishString: 'Confirm',
            ),
            ),
        )
      ]),
      body:  Center(
          child: SizedBox(
            width: 500,
            height: 300,
            child: Column(
              children: [
                Text(
                  LanguageService().translate(
                    frenchString: 'Temps initial',
                    englishString: 'Initial time',
                  ),
                  ),
                Slider(
                  min: 30,
                  max: 120,
                  divisions: 90,
                  label: "${initialTime} seconds",
                  value: initialTime.toDouble(),
                  onChanged: (double value) {
                    setState(() {
                      initialTime = value.toInt();
                    });
                  },
                ),
                Text(
                  LanguageService().translate(
                    frenchString: 'Temps max plafond (secondes):',
                    englishString: 'Max time ceiling (seconds):',
                  ),
                  ),
                Slider(
                  min: 0,
                  max: 150,
                  divisions: 120,
                  label: "$penalty seconds",
                  value: penalty.toDouble(),
                  onChanged: (double value) {
                    setState(() {
                      penalty = value.toInt();
                    });
                  },
                ),
                Text(
                  LanguageService().translate(
                    frenchString: 'Temps ajouté par différence trouvée (secondes):',
                    englishString: 'Time added per difference found (seconds):',
                  ),
                  ),
                Slider(
                  min: 0,
                  max: 10,
                  divisions: 10,
                  label: "${timeWon} seconds",
                  value: timeWon.toDouble(),
                  onChanged: (double value) {
                    setState(() {
                      timeWon = value.toInt();
                    });
                  },
                ),
                // Repeat for maxTime, timeWon, and other sliders.
                Text(
                  LanguageService().translate(
                    frenchString: 'Mode triche',
                    englishString: 'Cheat Mode',
                  ),
                  ),
                Switch(
                  value: cheatMode,
                  onChanged: (bool value) {
                    setState(() {
                      cheatMode = value;
                    });
                  },
                ),
                // Buttons for confirming, resetting, etc.
              ],
            ),
        ),
      ),
    );
  }
}
