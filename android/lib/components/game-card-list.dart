import 'dart:math';

import 'package:flutter/material.dart';
import 'package:polydiff/components/game-card.dart';
import 'package:polydiff/services/game-card-template.dart';

class GameCardListComponent extends StatefulWidget {
  final int first;
  final int last;
  final List<GameCardTemplate> gameCards;

  const GameCardListComponent({
    Key? key,
    required this.first,
    required this.last,
    required this.gameCards,
  }) : super(key: key);

  @override
  _GameCardListComponentState createState() => _GameCardListComponentState();
}

class _GameCardListComponentState extends State<GameCardListComponent> {
  List<GameCardTemplate> get gameCardsSlice {
    if (widget.gameCards.isNotEmpty) {
      final int end = min(widget.gameCards.length, widget.last);
      return widget.gameCards.sublist(widget.first, end);
    }
    return [];
  }

  @override
  Widget build(BuildContext context) {
    final currentSlice = gameCardsSlice;
    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
      ),
      itemCount: currentSlice.length,
      itemBuilder: (BuildContext context, int index) {
        return Padding(
          padding: EdgeInsets.all(10),
          child: GameCard(
            key: ValueKey(currentSlice[index].id),
            gameCard: currentSlice[index],
          ),
        );
      },
    );
  }
}
