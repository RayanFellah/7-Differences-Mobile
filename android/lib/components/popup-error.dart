import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:polydiff/interfaces/vec2.dart';
import 'package:polydiff/services/difference-detection-service.dart';
import 'package:polydiff/services/user.dart';

class PopupErrorWidget extends StatefulWidget {
  @override
  _PopupErrorWidgetState createState() => _PopupErrorWidgetState();
}

class _PopupErrorWidgetState extends State<PopupErrorWidget> {
  bool show = false;
  Vec2 mousePosition = Vec2(0,0);
  final DifferencesDetectionService differencesDetectionService = DifferencesDetectionService(); // Adjust based on how you access your singleton
  final AudioPlayer audioPlayer = AudioPlayer();

  @override
  void initState() {
    super.initState();
    bool start = true;
    const int oneSecond = 1000;

    differencesDetectionService.mousePositionStream.listen((Vec2 position) {
      setState(() {
        mousePosition = position;
      });
    });

    differencesDetectionService.validationStream.listen((bool isValid) {
      if (!isValid && !start) {
        setState(() {
          show = true;
        });
        playErrorSound();
        Future.delayed(Duration(milliseconds: oneSecond), () {
          setState(() {
            show = false;
          });
        });
      } else if (start) {
        start = false;
      }
    });
  }

  void playErrorSound() async {
    final String audioPath = User.specialErrorSoundUsed ? 'special-audios/fail-sound.mp3' : 'audios/error.mp3';
    await audioPlayer.play(AssetSource(audioPath));
  }

  @override
  Widget build(BuildContext context) {
    return Visibility(
      visible: show,
      child: Stack(
        children: [
          Positioned(
            top: mousePosition.y - 480,
            left: mousePosition.x,
            child: Container(
              color: Colors.red,
              padding: EdgeInsets.all(10),
              child: Text('ERROR', style: TextStyle(color: Colors.white)),
            ),
          ),
          Positioned.fill(
            child: GestureDetector(
              onTap: () => setState(() => show = false),
              child: Container(
                color: Colors.transparent,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    audioPlayer.dispose();
    super.dispose();
  }
}
