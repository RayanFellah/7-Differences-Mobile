import 'package:flutter/material.dart';
import 'package:polydiff/components/control-video-tool.dart';

class ControlVideo extends StatelessWidget {
  final ControlVideoTool controlVideoToolPlay;
  final ControlVideoTool controlVideoToolPause;
  final ControlVideoTool controlVideoToolRestart;
  final ControlVideoTool controlVideoToolForwardTwo;
  final ControlVideoTool controlVideoToolForwardFour;
  ControlVideo({super.key,
    required this.controlVideoToolPlay,
    required this.controlVideoToolPause,
    required this.controlVideoToolRestart,
    required this.controlVideoToolForwardTwo,
    required this.controlVideoToolForwardFour,
  });
  @override
  Widget build(BuildContext context) {
    return FittedBox(
        child: Row(
          children: [
            controlVideoToolPlay,
            controlVideoToolPause,
            controlVideoToolRestart,
            controlVideoToolForwardTwo,
            controlVideoToolForwardFour,
                       
          ],
        ),
    );
  }
}