import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:polydiff/pages/game-page-classic-1v1.dart';
import 'package:polydiff/pages/selecto-page.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/user.dart';

import '../services/game-info.dart';
import '../services/socket.dart';

class WaitingPageWidget extends StatefulWidget {
  // final String link1;
  // final String link2;
  final Uint8List img1;
  final Uint8List img2;
  final List<Difference>? diff;

  WaitingPageWidget(
      {Key? key, required this.img1, required this.img2, this.diff})
      : super(key: key);
  @override
  _WaitingPageWidgetState createState() => _WaitingPageWidgetState();
}

class _WaitingPageWidgetState extends State<WaitingPageWidget> {
  String gameName = '';
  String player1Name = '';
  String player2Name = '';
  String player3Name = '';
  String player4Name = '';
  bool gameClosed = false;
  // final socketService = SocketService();
  final gameInfo = GameInfoService();

  @override
  void initState() {
    super.initState();
    print('Waiting page initState');
    print('GameInfoService username: ${User.username}');
    print('GameInfoService game Name: ${gameInfo.gameName}');

    player1Name = User.username;
    print('PlayerName: ' + player1Name);
    gameName = gameInfo.gameName!;
    configSockets();
  }

  @override
  void dispose() {
    if (!gameClosed) {
      SocketService.socket.emit('leaveGame', null);
    }
    // newPlayerSubscription.cancel();
    // playerLeftSubscription.cancel();
    // abortGameSubscription.cancel();
    SocketService.socket.off('newPlayer');
    SocketService.socket.off('playerLeft');
    SocketService.socket.off('abortGame');

    super.dispose();
  }

  void configSockets() {
    SocketService.socket.on('newPlayer', (data) {
      print('newPlayer $data');
      if (mounted) {
        setState(() {
          if (player2Name.isEmpty) {
            player2Name = data['username'];
          } else if (player3Name.isEmpty) {
            player3Name = data['username'];
          } else if (player4Name.isEmpty) {
            player4Name = data['username'];
          }
        });
      }
    });

    SocketService.socket.on('playerLeft', (_) {
      setState(() {
        if (player4Name.isNotEmpty) {
          player4Name = '';
        } else if (player3Name.isNotEmpty) {
          player3Name = '';
        } else if (player2Name.isNotEmpty) {
          player2Name = '';
        }
      });
    });

    SocketService.socket.on('abortGame', (data) {
      if (data.message.isNotEmpty) {
        setState(() {
          gameClosed = true;
        });
        // Montrer dialog avec data.message
        // Aller a la selecto page
      }
    });
  }

  void startGame() {
    if (player2Name.isNotEmpty && player1Name.isNotEmpty) {
      SocketService.socket.emit('startGameMulti', {'gameName': gameName});
      // Navigate to game1v1 page
      print('Navigating to game page');
      Navigator.of(context).push(MaterialPageRoute(
          builder: (context) => GamePageClassic1v1(
              img1: widget.img1, img2: widget.img2, diff: widget.diff)));
    }
  }

  void rejectPlayer() {
    SocketService.socket.emit('rejectPlayer', null);
    setState(() {
      player2Name = '';
    });
  }

  void cancelGameCreator() {
    SocketService.socket.emit('leaveLobbyCreator', gameName);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false, // Remove back arrow from display

        title: Text(
          LanguageService().translate(
              frenchString: 'Salle d\'attente', englishString: 'Waiting Room'),
        ),
        actions: [
          ElevatedButton(
            onPressed: cancelGameCreator,
            child: Text(
              LanguageService()
                  .translate(frenchString: 'Annuler', englishString: 'Leave'),
            ),
          ),
          ElevatedButton(
            onPressed: player2Name.isNotEmpty ? startGame : null,
            child: Text(
              LanguageService()
                  .translate(frenchString: 'Jouer', englishString: 'Play'),
            ),
          ),
        ],
      ),
      body: Center(
        child: Container(
          width: MediaQuery.of(context).size.width * 0.6,
          height: MediaQuery.of(context).size.height * 0.6,
          padding: EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.secondary,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: <Widget>[
              Text(
                gameName.isNotEmpty ? gameName : 'Loading game...',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 20),
              _buildPlayerTile(
                  player1Name,
                  LanguageService().translate(
                      frenchString: 'En attente d\'un premier joueur...',
                      englishString: 'Waiting for a first player...')),
              _buildPlayerTile(
                  player2Name,
                  LanguageService().translate(
                      frenchString: 'En attente d\'un deuxième joueur...',
                      englishString: 'Waiting for a second player...')),
              _buildPlayerTile(
                  player3Name,
                  LanguageService().translate(
                      frenchString: 'En attente d\'un troisième joueur...',
                      englishString: 'Waiting for a third player...')),
              _buildPlayerTile(
                  player4Name,
                  LanguageService().translate(
                      frenchString: 'En attente d\'un quatrième joueur...',
                      englishString: 'Waiting for a fourth player...')),
              SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlayerTile(String playerName, String waitingMessage) {
    return Container(
      margin: EdgeInsets.symmetric(vertical: 8.0),
      child: playerName.isNotEmpty
          ? Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '$playerName' +
                      LanguageService().translate(
                          frenchString: ' a rejoint la partie',
                          englishString: ' has joined the game'),
                  style: TextStyle(fontSize: 18),
                ),
                IconButton(
                  icon: Icon(Icons.close),
                  onPressed: () {
                    rejectPlayer();
                  },
                ),
              ],
            )
          : Text(
              waitingMessage,
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
    );
  }
}
