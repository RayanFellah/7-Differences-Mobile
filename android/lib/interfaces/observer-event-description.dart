import 'package:polydiff/interfaces/event-description.dart';
import 'package:polydiff/pages/replay-page.dart';

class ObserverEventDescription extends EventDescription{
  
  final Rectangle rectangle;
  final String color;

  const ObserverEventDescription(super.time, this.rectangle, this.color);

  ObserverEventDescription.fromJson(Map<String, dynamic> json)
      : rectangle = json['rectangle'],
        color = json['color'],
        super.fromJson(json);

  Map<String, dynamic> toJson() {
    return {
      'time': time,
      'rectangle': rectangle,
      'color': color,
    };
  }

  @override
  play(ReplayPage replayPage) {
    print("ObserverEventDescription.play() called.");
  }
  
}

class Rectangle{
  int startX;
  int startY;
  int width;
  int height;
  Rectangle(this.startX, this.startY, this.width, this.height);
}