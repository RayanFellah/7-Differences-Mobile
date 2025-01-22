import 'dart:async';

import 'package:polydiff/interfaces/event-description.dart';


class ClickHistoryServiceDart {
  static List<EventDescription> clickHistory = [];
  static StreamController<int>? incremented=StreamController<int>.broadcast();
  static Timer? timer;
  static int timeFraction = 0;

  static void startStream() {
    incremented = StreamController<int>.broadcast();
  }

  static void startTimer([int interval = 100]) {
    timer = Timer.periodic(Duration(milliseconds: interval), (Timer t) => addTime());
  }

  static void addTime() {
    timeFraction += 1;
    if (incremented != null && !incremented!.isClosed) {
      emitNextSubject();
    }
  }

  static void emitNextSubject() {
    
    incremented?.add(timeFraction);
  }

  static void addEvent(EventDescription event) {
    clickHistory.add(event);
  }

  static void reinit() {
    clickHistory = [];
    stopTimer();
  }

  static void stopTimer() {
    timer?.cancel();
    timeFraction = 0;
  }

  static dispose() {
    incremented?.close();
    timer!.cancel();
    timeFraction = 0;
  }

}
