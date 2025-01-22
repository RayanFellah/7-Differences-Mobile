

import 'package:polydiff/interfaces/click-event-description.dart';
import 'package:polydiff/interfaces/counter-event-description.dart';
import 'package:polydiff/interfaces/end-game-event-description.dart';
import 'package:polydiff/interfaces/observer-event-description.dart';
import 'package:polydiff/interfaces/vec2.dart';
import 'package:polydiff/services/click-history.dart';

class ReplayService{
  ReplayService();

  restartTimer(){
    ClickHistoryServiceDart.stopTimer();
    ClickHistoryServiceDart.startTimer();
  }

  stopTimer(){
    ClickHistoryServiceDart.stopTimer();
  }

  addClickEventReplay(Vec2 coord){
    var event = clickEventDescription(ClickHistoryServiceDart.timeFraction, coord.x, coord.y);
    ClickHistoryServiceDart.addEvent(event);
   // debugger( );
    //inspect(ClickHistoryServiceDart.clickHistory);
  }

  addCounterEventReplay(List<int> userCounter){
    var event = CounterEventDescription(ClickHistoryServiceDart.timeFraction, userCounter);
    ClickHistoryServiceDart.addEvent(event);
    //debugger( );
    //inspect(ClickHistoryServiceDart.clickHistory);
  }

  addEndGameEventReplay(){
    var event = EndGameEventDescription(ClickHistoryServiceDart.timeFraction);
    ClickHistoryServiceDart.addEvent(event);
    //debugger( );
    //inspect(ClickHistoryServiceDart.clickHistory);
  }

  addObserverEventReplay(Rectangle rectangle, String color){
    var event = ObserverEventDescription(ClickHistoryServiceDart.timeFraction, rectangle, color);
    ClickHistoryServiceDart.addEvent(event);
    //debugger( );
    //inspect(ClickHistoryServiceDart.clickHistory);
  }

  dispose(){
    print('dispose ReplayService');
    ClickHistoryServiceDart.dispose();
  }


}