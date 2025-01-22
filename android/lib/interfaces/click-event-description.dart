import 'package:polydiff/interfaces/event-description.dart';
import 'package:polydiff/pages/replay-page.dart';

class clickEventDescription extends EventDescription {
  final double x;
  final double y;

  const clickEventDescription(super.time, this.x, this.y);

  clickEventDescription.fromJson(Map<String, dynamic> json)
      : x = json['x'].toDouble(),
        y = json['y'].toDouble(),
        super.fromJson(json);

  Map<String, dynamic> toJson() {
    return {
      'time': time,
      'x': x.round(),
      'y': y.round(),
    };
  }

  @override
  play(ReplayPage replayPage) {
    print('clickEventDescription.play ');
    replayPage.gameKey.currentState?.widget.playArea1Key.currentState!.differencesDetectionService.mouseHitDetect(
      x, y, replayPage.gameKey.currentState?.widget.playArea1Key.currentState!.widget.diff);
  }
}
