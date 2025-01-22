import 'dart:async';

import 'package:polydiff/interfaces/event-description.dart';
import 'package:polydiff/pages/replay-page.dart';
import 'package:polydiff/services/click-history.dart';

class EndGameEventDescription extends EventDescription {
  EndGameEventDescription(super.time);

  static StreamController<int>? endGame = StreamController<int>.broadcast();

  EndGameEventDescription.fromJson(Map<String, dynamic> json) : super.fromJson(json);

  Map<String, dynamic> toJson() {
    return {
      'time': time,
    };
  }

  @override
  play(ReplayPage replayPage) {
    print("EndGameEventDescription.play() called.");
    replayPage.gameKey.currentState?.widget.chronometerKey.currentState?.stopTimer();
    ClickHistoryServiceDart.timer?.cancel();
    endGame?.add(0);
    //replayPage.gameKey.currentState?.widget.createState().currentGameService.gameEnded(true, GameStats(winner: "", loser: "", winnerDifferencesFound: 0, loserDifferencesFound: 0, gameTime: 0));
    //replayPage.gamePage.createState().currentGameService.endGameStream.
  }
}
