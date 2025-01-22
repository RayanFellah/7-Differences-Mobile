import 'dart:async';

import 'package:flutter/material.dart';

class ChronometerWidget extends StatefulWidget {
  final int penalty;
  final Function(bool) onTimeUp;

  const ChronometerWidget({
    Key? key,
    this.penalty = 30,
    required this.onTimeUp,
  }) : super(key: key);

  @override
  ChronometerWidgetState createState() => ChronometerWidgetState();
}

class ChronometerWidgetState extends State<ChronometerWidget> {
  Timer? _timer;
  int _seconds = 0;
  bool _isPenalty = false;

  @override
  void initState() {
    super.initState();
    startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  int get seconds => _seconds;

  void startTimer({int interval = 1000}) {
    _timer?.cancel(); // Cancel any existing timer
    _timer = Timer.periodic(Duration(milliseconds: interval), (timer) {
      if (_isPenalty) {
        _isPenalty = false;
        setState(() {
          _seconds += widget.penalty;
        });
      } else {
        setState(() {
          _seconds++;
        });
      }
    });
  }

  void applyPenalty({bool isClassic = true}) {
    _isPenalty = true;
    if (isClassic) {
      setState(() {
        _seconds += widget.penalty;
      });
    } else {
      if (_seconds > widget.penalty) {
        setState(() {
          _seconds -= widget.penalty;
        });
      } else {
        _timer?.cancel();
        widget.onTimeUp(true);
      }
    }
  }

  void startCountDownFrom(int seconds) {
    _timer?.cancel();
    _seconds = seconds;
    _timer = Timer.periodic(Duration(seconds: 1), (timer) {
      if (_seconds > 0) {
        setState(() {
          _seconds--;
        });
      } else {
        timer.cancel();
        widget.onTimeUp(true);
      }
    });
  }

  void stopTimer() {
    _timer?.cancel();
  }

  @override
  Widget build(BuildContext context) {
    int minutes = _seconds ~/ 60;
    int remainingSeconds = _seconds % 60;
    return Container(
      child: Text(
        '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}',
        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
      ),
    );
  }
}
