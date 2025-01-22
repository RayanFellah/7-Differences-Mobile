// ignore_for_file: use_build_context_synchronously

import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:polydiff/components/waiting-page-limite.dart';
import 'package:polydiff/interfaces/game-access-type.dart';
import 'package:polydiff/pages/waiting-page.dart';
import 'package:polydiff/services/consts.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/game-card-template.dart';
import 'package:polydiff/services/game-constants-service.dart';
import 'package:polydiff/services/image-transfer.dart';
import 'package:polydiff/services/interfaces/game-consts-interface.dart';
import 'package:polydiff/services/socket.dart';
import 'package:polydiff/services/user.dart';

class GameConstantsClassique extends StatefulWidget {
  late GameAccessType gameAccessType;
  late GameCardTemplate gameCard;
  final Uint8List img1;
  final Uint8List img2;
  final List<Difference>? diff;

// constructor with type GameAccessType
  GameConstantsClassique({
    Key? key,
    required this.gameAccessType,
    required this.gameCard,
    required this.img1,
    required this.img2,
    required this.diff,
  }) : super(key: key);

  @override
  _GameConstantsClassiqueState createState() => _GameConstantsClassiqueState();
}

class _GameConstantsClassiqueState extends State<GameConstantsClassique> {
  int initialTime = Consts.DEFAULT_INITIAL_TIME;
  late bool cheatMode = Consts.DEFAULT_CHEAT_MODE;

  String username = '';

  final GameConstantsService gameConstantsService = GameConstantsService();
  final ImageTransferService _imageTransfer = ImageTransferService();

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    username = User.username;
    initialize();
  }

  void initialize() async {
    Constants constants = await gameConstantsService.getConstants();
    setState(() {
      initialTime = constants.initialTime;
      cheatMode = constants.cheatMode;
    });
  }

  void setConstants() async {
    Constants constants = Constants(
      initialTime: initialTime,
      cheatMode: cheatMode,
    );
    await gameConstantsService.setConstants(constants);
    createLobby(widget.gameAccessType);
  }

  void createLobby(GameAccessType gameAccessType) {
    print('Creating lobby');
    SocketService.socket.emit('createGameMulti', {
      'username': username,
      'gameAccessType': gameAccessType.index,
      'isObserver': false,
      'initialTime': initialTime,
      'cheatMode': cheatMode,
      'gameCardId': widget.gameCard.id
    });
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => WaitingPageWidget(img1: _imageTransfer.img1!, img2: widget.img2), // change to waiting page
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Constantes de Jeu"),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Text('Temps initial (secondes):'),
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
            // Repeat for maxTime, timeWon, and other sliders.
            SwitchListTile(
              title: Text("Cheat Mode"),
              value: cheatMode,
              onChanged: (bool value) {
                setState(() {
                  cheatMode = value;
                });
              },
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: setConstants,
              child: Text("Confirmer"),
            )
            // Buttons for confirming, resetting, etc.
          ],
        ),
      ),
    );
  }
}
