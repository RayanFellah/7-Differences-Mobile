import 'package:flutter/material.dart';
import 'package:polydiff/components/limited-selecto.dart';
import 'package:polydiff/pages/limited-time-page.dart';
import 'package:polydiff/services/game-info.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/socket.dart';
import 'package:polydiff/services/user.dart';

class WaintingPageLimite extends StatefulWidget {
  @override
  _WaintingPageLimiteState createState() => _WaintingPageLimiteState();
}

class _WaintingPageLimiteState extends State<WaintingPageLimite> {
  String gameName = '';
  String player1Name = '';
  String player2Name = '';
  String player3Name = '';
  String player4Name = '';
  bool gameClosed = false;
  // final socketService = SocketService();
  final gameInfo = GameInfoService();

  get createLobby => null;

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
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(
        LanguageService().translate(
          frenchString: 'Salle d\'attente',
          englishString: 'Waiting Room',
          )
        ),
        actions: [
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      // Navigator.push(
                      //   context,
                      //   MaterialPageRoute(builder: (context) => MainPage()),
                      // );
                    },
                    child: Text('Annuler'),
                  ),
                  ElevatedButton(
                    onPressed: player2Name.isNotEmpty ? startGame : null,
                    child: Text('Jouer'),
                  ),
        ]),
      body: Center(
        // Centre le contenu
        child: Container(
          height:
              MediaQuery.of(context).size.height * 0.5, // 50% of screen height
          width: MediaQuery.of(context).size.width * 0.4,
          padding:
              EdgeInsets.all(20), // Espacement autour du contenu de la boîte
          decoration: BoxDecoration(
            color: Color.fromARGB(255, 14, 35, 145), // Couleur de la "boîte"
            borderRadius: BorderRadius.circular(20), // Bord arrondi de la boîte
          ),
          child: Column(
            mainAxisSize: MainAxisSize
                .min, // Réduit la taille de la colonne à son contenu
            children: <Widget>[
              _buildPlayerTile(
                  player1Name, 'En attente d\'un premier joueur...'),
              _buildPlayerTile(
                  player2Name, 'En attente d\'un deuxième joueur...'),
              _buildPlayerTile(
                  player3Name, 'En attente d\'un troisième joueur...'),
              _buildPlayerTile(
                  player4Name, 'En attente d\'un quatrième joueur...'),
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
                  playerName+
                  LanguageService().translate(
                    frenchString: ' a rejoint la partie',
                    englishString: ' has joined the game',
                  ),
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

    SocketService.socket.on('players', (data) {
      print('players $data');
      if (data.length == 1) {
        if (mounted) {
          setState(() {
            player1Name = data[0].name;
            player2Name = '';
            player3Name = '';
            player4Name = '';
          });
        } else if (data.length == 2) {
          if (mounted) {
            setState(() {
              player1Name = data[0].name;
              player2Name = data[1].name;
              player3Name = '';
              player4Name = '';
            });
          }
        } else if (data.length == 3) {
          if (mounted) {
            setState(() {
              player1Name = data[0].name;
              player2Name = data[1].name;
              player3Name = data[2].name;
              player4Name = '';
            });
          }
        } else if (data.length == 4) {
          if (mounted) {
            setState(() {
              player1Name = data[0].name;
              player2Name = data[1].name;
              player3Name = data[2].name;
              player4Name = data[3].name;
            });
          }
        }
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
      if (data['message'].isNotEmpty) {
        setState(() {
          gameClosed = true;
        });
        SocketService.socket.emit('leaveGame', null);
        // OPEN DIALOG
        showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              title: Text(
                LanguageService().translate(
                  frenchString: 'Partie annulée',
                  englishString: 'Game cancelled',
                ),
              ),
              content: Text(data['message']),
              actions: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => LimitedSelecto(),
                      ),
                    );
                  },
                  child: Text('OK'),
                ),
              ],
            );
          },
        );
      }
    });
  }

  void startGame() {
    if (player2Name.isNotEmpty && player1Name.isNotEmpty) {
      SocketService.socket.emit('startGameLimite', {});
      print('Navigating to limited game page');
      gameClosed = true;

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => LimitedTimePage(),
        ),
      );
    }
  }

  void rejectPlayer() {
    SocketService.socket.emit('rejectPlayer', null);
    setState(() {
      player2Name = '';
    });
  }

  void leaveLobbyCreator() {
    SocketService.socket.emit('leaveLobbyCreator', gameName);
  }

  @override
  dispose() {
    super.dispose();

    if (!gameClosed) {
      SocketService.socket.emit('leaveGame', null);
    }
    SocketService.socket.off('newPlayer');
    SocketService.socket.off('players');
    SocketService.socket.off('playerLeft');
    SocketService.socket.off('abortGame');
    SocketService.socket.off('leaveLobbyCreator');
    SocketService.socket.off('startGameLimite');
    SocketService.socket.off('rejectPlayer');
    SocketService.socket.off('leaveGame');
  }
}
