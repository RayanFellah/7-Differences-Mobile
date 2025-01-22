import 'package:flutter/material.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/user.dart';

class UserStatisticsTable extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topLeft,
      child: Padding(
        padding: EdgeInsets.only(left: 20, top: 10, right: 10, bottom: 20),
        child: ConstrainedBox(
          constraints: BoxConstraints(
              maxHeight: 300, maxWidth: 600), // Set the maximum height
          child: Table(
            // nombre de parties jouées, nombre de parties gagnées, moyenne de différences trouvées par partie, temps moyen par partie)
            children: [
              TableRow(
                children: [
                  Text(LanguageService().translate(
                          frenchString: 'Nombre de parties jouées',
                          englishString: 'Number of played games') +
                      ' : '),
                  Text(User.totalPlayedGames.toString()),
                ],
              ),
              TableRow(
                children: [
                  Text(LanguageService().translate(
                          frenchString: 'Nombre de parties gagnées',
                          englishString: 'Number of won games') +
                      ' : '),
                  Text(User.totalWonGames.toString()),
                ],
              ),
              TableRow(
                children: [
                  Text(LanguageService().translate(
                          frenchString:
                              'Moyenne de différences trouvées par partie',
                          englishString: 'Average found differences per game') +
                      ' : '),
                  Text(User.avgFoundDifferencePerGame.toString()),
                ],
              ),
              TableRow(
                children: [
                  Text(LanguageService().translate(
                          frenchString: 'Durée moyenne par partie (secondes)',
                          englishString: 'Average game duration (seconds)') +
                      ' : '),
                  Text(User.avgGameDuration.toString()),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
