import 'dart:async';

import 'package:flutter/material.dart';

class Countdown extends StatefulWidget {

  const Countdown({
    Key? key,
  }) : super(key: key);
  @override
  CountdownState createState() => CountdownState();
}

class CountdownState extends State<Countdown> {
  Timer? _timer;
  int start = 120;

  // getter for minuts
  int get minutes => start ~/ 60;
  //getter for seconds
  int get seconds => start % 60;

  int get remainingTime => start;

  void startTimer({Duration duration = const Duration(seconds: 1)}) {
    _timer = Timer.periodic(
     duration,
      (Timer timer) {
        if (start == 0) {
          setState(() {
            timer.cancel();
          });
        } else {
          setState(() {
            start--;
          });
        }
      },
    );
  }

  @override
  void initState() {
    startTimer();
    super.initState();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void addTime(int time) {
    start += time;
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text(
        "${start ~/ 60}:${(start % 60).toString().padLeft(2, '0')}",
        style: TextStyle(fontSize: 48),
      ),
    );
  }

  void startCountDownFrom(int seconds) {
    print('startCountDownFrom: $seconds');
    _timer?.cancel();
    start = seconds;
    _timer = Timer.periodic(Duration(seconds: 1), (timer) {
      if (start > 0) {
        setState(() {
          start--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  void stopTimer() {
    _timer?.cancel();
    // _start = 0;
  }
}