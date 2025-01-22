import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:polydiff/components/select-lobby.dart';
import 'package:polydiff/interfaces/game-access-type.dart';
import 'package:polydiff/pages/game-page-classic-1v1.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/friends.dart';
import 'package:polydiff/services/image-transfer.dart';
import 'package:polydiff/services/language.dart';

// import 'package:socket_io_client/socket_io_client.dart';

import '../pages/waiting-page.dart';
import '../services/communication.dart';
import '../services/game-card-template.dart';
import '../services/game-classes.dart';
import '../services/game-info.dart';
import '../services/socket.dart';
import '../services/user.dart';

class GameCard extends StatefulWidget {
  final GameCardTemplate gameCard;
  const GameCard({Key? key, required this.gameCard}) : super(key: key);
  @override
  _GameCardState createState() => _GameCardState();
}

class _GameCardState extends State<GameCard> {
  final ImageTransferService _imageTransfer = ImageTransferService();
  // final SocketService socketService = SocketService();
  final CommunicationService _communication = CommunicationService();
  final GameInfoService gameInfo = GameInfoService();
  StreamSubscription<String>? usernameSubscription;

  String img1URL = '';
  String img2URL = '';
  // String img1 = '';
  // String img2 = '';
  Uint8List? img1;
  Uint8List? img2;
  String page = '';
  String username = '';
  String username2 = '';
  bool isWaiting = false;
  bool isFull = false;
  String name = '';
  String difficulty = '';
  int nDiff = 0;
  List<dynamic> lobbies = [];
  List<NewTime> timesSolo = [];
  List<NewTime> times1v1 = [];
  List<Uint8List> allImages1 = [];
  List<Uint8List> allImages2 = [];

  @override
  void initState() {
    super.initState();
    name = widget.gameCard.name;
    difficulty = widget.gameCard.difficulty.value;
    nDiff = widget.gameCard.differences.length;

    if (widget.gameCard.img1ID.isNotEmpty &&
        widget.gameCard.img2ID.isNotEmpty) {
      _downloadImage(widget.gameCard.img1ID, true);
      _downloadImage(widget.gameCard.img2ID, false);
    }
    _configSockets();
    SocketService.socket.emit('getLobbies', {});
  }
  

  _configSockets() {
    SocketService.socket.on('updateLobbies', (dynamic data) async {
      print('yo khoya');
      if (data != null && mounted) {
        if (mounted) {
          var filterstatus = data
              .where((game) =>
                  (game['status'] == 0 || game['status'] == 4) &&
                  game['gameCard']['name'] == name)
              .toList();
          List<dynamic> games = [];
          for (var game in filterstatus) {
            if (await FriendsService.isUserAllowedInGame(game)) {
              print('Allowed');
              games.add(game);
            }
          }

          setState(() {
            lobbies = games;
            print('lobbies: $lobbies');
            if (lobbies.isNotEmpty) {
              List<dynamic> jsonDifferences =
                  lobbies[0]['gameCard']['differences'];
              List<Difference> differences = jsonDifferences
                  .map((jsonDifference) => Difference.fromJson(jsonDifference))
                  .toList();
              widget.gameCard.differences = differences;
              _imageTransfer.diff = differences;
            }
          });
        }
      }
    });

    SocketService.socket.on('gameCardStatus', (data) {
      if (data['cardId'] != null &&
          data['isWaiting'] != null &&
          data['isFull'] != null &&
          data['cardId'] == widget.gameCard.id) {
        if (mounted) {
          setState(() {
            isWaiting = data['isWaiting'] || data['isFull'];
            isFull = data['isFull'];
          });
        }
      }
    });

    SocketService.socket.on('gameFull', (data) {
      if (data['cardId'] != null && data['cardId'] == widget.gameCard.id) {
        // _openDialogNotify(
        //     'La partie est pleine');
      }
    });

    SocketService.socket.on('createdNewRoom', (data) {
      if (data['cardId'] == widget.gameCard.id) {
        _transferImage();
        _transferInfo(username);
        print('new Room');

        Navigator.of(context).push(
          MaterialPageRoute(
              builder: (context) => WaitingPageWidget(
                  img1: _imageTransfer.img1!,
                  img2: _imageTransfer.img2!,
                  diff: _imageTransfer.diff)),
        ).then((_) {
          SocketService.socket.emit('getLobbies', {});
        });
      }
    });

    SocketService.socket.on('startGame', (data) {
      if (data['cardId'] == widget.gameCard.id) {
        print('startGame: $data');
        // Navigator.of(context).popUntil((route) => route.isFirst);
        if (mounted) {
          setState(() {
            name = data['gameName'];
          });
        }

        _transferImage();
        _transferInfo(data['username'], User.username);

        // Navigator.of(context).pushReplacementNamed('/game1v1');
        print('here in start-game socket');
        Navigator.of(context).push(MaterialPageRoute(
          builder: (context) => GamePageClassic1v1(
            img1: _imageTransfer.img1!,
            img2: _imageTransfer.img2!,
            diff: _imageTransfer.diff,
          ),
        ));
      }
    });

    SocketService.socket.on('abortGame', (data) {
      if (data['message'] != null &&
          data['cardId'] != null &&
          data['cardId'] == widget.gameCard.id) {
        SocketService.socket.emit('leaveGame', {});
      }
    });

    SocketService.socket
        .emit('askGameCardStatus', {'cardId': widget.gameCard.id});
  }

  void _downloadImage(String id, bool isFirstImage) {
    print('Downloading image: $id');
    _communication.downloadImage(id).then((res) {
      var bytes = base64Decode(res.body);
      if (mounted) {
        setState(() {
          print('res.body: ${res.body}');
          if (isFirstImage) {
            img1 = bytes;
            allImages1.add(img1!);
            print('iciii $img1');
            img1URL = 'url(data:image/bmp;base64,${res.body})';
            // img1 = 'data:image/bmp;base64,${res.body}';
          } else {
            img2URL = 'url(data:image/bmp;base64,${res.body})';
            // img2 = 'data:image/bmp;base64,${res.body}';
            img2 = bytes;
            allImages2.add(img2!);
          }
        });
      }
    });
  }

  @override
  void dispose() {
    usernameSubscription?.cancel();
    usernameSubscription = null; // Break the reference to prevent memory leaks
    super.dispose();
  }

  void _transferImage() {
    _imageTransfer.link1 = img1URL;
    _imageTransfer.link2 = img2URL;
    _imageTransfer.img1 = img1;
    _imageTransfer.img2 = img2;
    _imageTransfer.diff = widget.gameCard.differences;
  }

  void _transferInfo(String username,
      [String? username2, String? username3, String? username4]) {
    gameInfo.username = username;
    gameInfo.username2 = username2 ?? '';
    gameInfo.username3 = username3 ?? '';
    gameInfo.username4 = username4 ?? '';
    gameInfo.isLeader = username2 == null;
    gameInfo.gameName = name;
    gameInfo.gameCardId = widget.gameCard.id;
    gameInfo.difficulty = difficulty;
    gameInfo.nDiff = widget.gameCard.differences.length;
    print('${gameInfo.nDiff} difffs');
  }

  void transferDefault() {
    SocketService.socket
        .emit('joinGameSolo', {'gameCardId': widget.gameCard.id});

    _transferImage();

    _transferInfo(username, username2);

    Navigator.of(context).popUntil((route) => route.isFirst);
    Navigator.of(context).pushReplacementNamed('/game');
  }

  // void joinGameMulti() {
  //   print('joinGameMulti game-card.dart');
  //   print(User.username);
  //   socketService.emit('joinGameMulti',
  //       {'gameCardId': widget.gameCard.id, 'username': User.username});

  //   _openDialogLoad();
  // }

  void createGameMulti(GameAccessType accessType) {
    print('createGameMulti');
    SocketService.socket.emit('createGameMulti', {
      'gameCardId': widget.gameCard.id,
      'username': User.username,
      'gameAccessType': accessType.index
    });
    // _openDialogLoad();
  }

  void selectGame() {
    SocketService.socket.emit('getLobbies', {});
  }

  void leaveGame() {
    SocketService.socket.emit('leaveGame', null);
  }

  _openDialogLoad() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          content: Container(
            height: 100,
            child: Column(
              children: [
                CircularProgressIndicator(),
                Text('En attente du lancement de la partie...'),
              ],
            ),
          ),
          actions: <Widget>[
            TextButton(
              child: Text('Annuler'),
              onPressed: () {
                leaveGame();
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  void openDialogDeleteCard() {
    //TODO
  }

  void openDialogReinitCard() {
    //TODO
  }

  Widget _buildImageWidget(Uint8List? imageData) {
    if (imageData == null) {
      return SizedBox(); // Retourne un conteneur vide si aucune image.
    }
    return Image.memory(imageData);
  }

  void joinGameById(String gameId) {
    // print('Joining lobby with gameId: $gameId');
    // Vous pourriez avoir un service ou une instance de socket disponible dans votre classe d'état
    print('Joining lobby with gameCardId: ${widget.gameCard.id}');
    print('Joining lobby with gameId: $gameId');
    SocketService.socket.emit('joinGameMultiById', {
      'gameCardId': widget.gameCard.id,
      'lobbyId': gameId,
      'username': User.username,
    });
    _openDialogLoad();
  }

  void onLobbySelected(String gameId) {
    print('Selected Lobby: $gameId');
    return joinGameById(gameId);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Container(
          child: Column(
            children: [
              // Section des images
              Container(
                child: Stack(
                  children: [
                    // Affichage des images
                    ...allImages1
                        .map(
                          (imageData) => Image.memory(imageData),
                        )
                        .toList(),
                    Column(
                      children: [
                        // Section des informations sur le jeu
                        Container(
                          width: 200,
                          height: 70,
                          decoration: BoxDecoration(
                            color: difficulty == 'Facile'
                                ? Color.fromARGB(200, 76, 175, 79)
                                : Color.fromARGB(200, 244, 67, 54),
                            // transparency
                          ),
                          child: Column(
                            children: [
                              // Affichage du nom du jeu
                              Text(
                                LanguageService().translate(
                                        frenchString: 'Fiche :',
                                        englishString: 'Card :') +
                                    ' ' +
                                    name,
                                key: Key('name'),
                                style: TextStyle(
                                  color: Colors.white,
                                ),
                              ),
                              // Affichage de la difficultÃ© du jeu
                              Text(
                                difficulty,
                                key: Key('difficulty'),
                                style: TextStyle(
                                  color: Colors.white,
                                ),
                              ),
                              Text(
                                LanguageService().translate(
                                      frenchString: 'Number de différences : ',
                                      englishString: 'Number of differences : ',
                                    ) +
                                    nDiff.toString(),
                                style: TextStyle(
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  ],
                ),
              ),
              Container(
                width: double.infinity,
                color: Theme.of(context).colorScheme.secondary,
                margin: EdgeInsets.all(5),
                padding: EdgeInsets.all(5),
                child: Column(
                  children: [
                    Text(
                      LanguageService().translate(
                          frenchString: 'Créer une partie : ',
                          englishString: 'Create a game : '),
                      textAlign: TextAlign.center,
                    ),
                    Row(children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            createGameMulti(GameAccessType.ALL);
                          },
                          child: Text(LanguageService().translate(
                              frenchString: 'Tous', englishString: 'All')),
                        ),
                      ),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            createGameMulti(GameAccessType.FRIENDS_ONLY);
                          },
                          child: Text(LanguageService().translate(
                              frenchString: 'Amis', englishString: 'Friends')),
                        ),
                      ),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            createGameMulti(
                                GameAccessType.FRIENDS_AND_THEIR_FRIENDS);
                          },
                          child: Text(LanguageService().translate(
                              frenchString: 'Amis++',
                              englishString: 'Friends++')),
                        ),
                      ),
                    ]),
                  ],
                ),
              ),
              Container(
                width: double.infinity,
                height: 150,
                color: Theme.of(context).colorScheme.secondary,
                margin: EdgeInsets.all(5),
                padding: EdgeInsets.all(5),
                child: Column(
                  children: [
                    Text(
                      LanguageService().translate(
                          frenchString: 'Joindre une partie : ',
                          englishString: 'Join a game : '),
                      textAlign: TextAlign.center,
                    ),
                    Expanded(
                      child: Container(
                        width: 400,
                        child: PopupSelectLobbyComponent(
                          lobbies: lobbies,
                          onLobbySelected: (String lobbyId) {
                            print('${widget.gameCard.id} heeere');
                            onLobbySelected(lobbyId); // Appel direct ici
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                height: 150,
                width: double.infinity,
                color: Theme.of(context).colorScheme.secondary,
                margin: EdgeInsets.all(5),
                padding: EdgeInsets.all(5),
                child: Column(
                  children: [
                    Text(
                      LanguageService().translate(
                          frenchString: 'Observer une partie en cours : ',
                          englishString: 'Watch a game in progress : '),
                      textAlign: TextAlign.center,
                    ),
                    // TODO Obervateur...
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
