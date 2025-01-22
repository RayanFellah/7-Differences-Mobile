import 'package:polydiff/interfaces/event-description.dart';
import 'package:polydiff/pages/replay-page.dart';

class CounterEventDescription extends EventDescription {
  final List<int> userCounter;

  const CounterEventDescription(super.time, this.userCounter);

  CounterEventDescription.fromJson(Map<String, dynamic> json)
      : userCounter = json['userCounter'].cast<int>(),
        super.fromJson(json);

  Map<String, dynamic> toJson() {
    return {
      'time': time,
      'userCounter': userCounter,
    };
  }

  @override
  play(ReplayPage replayPage) {
    print("CounterEventDescription.play() called.");
    replayPage.gameKey.currentState?.widget.createState().gameInfo.playerCounts[0] = userCounter[0];
    replayPage.gameKey.currentState?.widget.createState().gameInfo.playerCounts[1] = userCounter[1];
    replayPage.gameKey.currentState?.widget.createState().gameInfo.playerCounts[2] = userCounter[2];
    replayPage.gameKey.currentState?.widget.createState().gameInfo.playerCounts[3] = userCounter[3];
  }
}
