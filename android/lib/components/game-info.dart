import 'package:flutter/material.dart';
import '../services/game-info.dart';

class GameInfoComponent extends StatefulWidget {
  @override
  _GameInfoComponentState createState() => _GameInfoComponentState();
}

class _GameInfoComponentState extends State<GameInfoComponent> {
  String? gameName;
  String? difficulty;
  int? nDiff;

  @override
  void initState() {
    super.initState();
    gameName = GameInfoService().gameName;
    difficulty = GameInfoService().difficulty;
    nDiff = GameInfoService().nDiff;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Column(
        children: [
          Text('Nom du jeu: $gameName'),
          Text('Difficulté: $difficulty'),
          Text('Nombre de différences total: $nDiff'),
        ],
      ),
    );
  }
}
