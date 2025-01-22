import 'package:polydiff/pages/replay-page.dart';

import 'observer-event-description.dart';

abstract class EventDescription {
  final int time;
  final double? x=null;
  final double? y=null;
  final List<int>? userCounter=null;
  final Rectangle? rectangle=null;
  final String? color=null;

  EventDescription.fromJson(Map<String, dynamic> json)
      : time = json['time'];



  const EventDescription(this.time);
  play(ReplayPage replayPage);
}