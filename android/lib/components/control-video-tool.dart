import 'package:event/event.dart';
import 'package:flutter/material.dart';

enum videoTool { play, pause, restart, forwardTwo, forwardFour }

class ControlVideoTool extends StatelessWidget {
  final videoToolEmitter = Event<Value<videoTool>>();
  final videoTool tool;
  ControlVideoTool({
    Key? key,
    required this.tool,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return IconButton(
        iconSize: 50,
        icon: Icon(
          tool == videoTool.play
              ? Icons.play_arrow_rounded
              : tool == videoTool.pause
                  ? Icons.pause_rounded
                  : tool == videoTool.restart
                      ? Icons.replay_rounded
                      : tool == videoTool.forwardTwo
                          ? Icons.arrow_forward_ios_rounded
                          : Icons.fast_forward_rounded,
        ),
        onPressed: () {
          videoToolEmitter.broadcast(Value<videoTool>(tool));
        });
  }
}
