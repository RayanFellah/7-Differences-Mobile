import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:polydiff/components/control-video-tool.dart';
import 'package:polydiff/components/control-video.dart';
import 'package:polydiff/interfaces/end-game-event-description.dart';
import 'package:polydiff/interfaces/event-description.dart';
import 'package:polydiff/pages/game-page-classic-1v1.dart';
import 'package:polydiff/pages/main-page.dart';
import 'package:polydiff/services/click-history.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/user.dart';

class ReplayPage extends StatefulWidget {
  final Uint8List img1;
  final Uint8List img2;
  final List<Difference>? diff;
  final GlobalKey<GamePageClassic1v1State> gameKey =
      GlobalKey<GamePageClassic1v1State>();
  ReplayPage({
    super.key,
    required this.img1,
    required this.img2,
    required this.diff,
  });
  @override
  State<ReplayPage> createState() => _ReplayPageState();
}

class _ReplayPageState extends State<ReplayPage> {
  double value = 0;
  late EventDescription currentEvent;
  int indexEvent = 0;
  int lastIndex = 0;
  videoTool currentState = videoTool.play;
  bool saved = false;

  final String baseUrl = '${dotenv.env['SERVER_URL_AND_PORT']}api/fs/players';

  final ControlVideoTool controlVideoToolPlay =
      ControlVideoTool(tool: videoTool.play);
  final ControlVideoTool controlVideoToolPause =
      ControlVideoTool(tool: videoTool.pause);
  final ControlVideoTool controlVideoToolRestart =
      ControlVideoTool(tool: videoTool.restart);
  final ControlVideoTool controlVideoToolForwardTwo =
      ControlVideoTool(tool: videoTool.forwardTwo);
  final ControlVideoTool controlVideoToolForwardFour =
      ControlVideoTool(tool: videoTool.forwardFour);
  final LanguageService languageService = LanguageService();
  late GamePageClassic1v1 gamePage;
  //final ClickHistoryServiceDart clickHistoryService = ClickHistoryServiceDart();

  @override
  void initState() {
    print('${ClickHistoryServiceDart.timeFraction} timeFraction ReplayPage');
    gamePage = GamePageClassic1v1(
      key: widget.gameKey,
      img1: widget.img1,
      img2: widget.img2,
      diff: widget.diff,
      isReplay: true,
    );
    super.initState();
    controlVideoToolPlay.videoToolEmitter.subscribe((event) {
      updateChrono(videoTool.play);
    });
    controlVideoToolPause.videoToolEmitter.subscribe((event) {
      updateChrono(videoTool.pause);
    });
    controlVideoToolRestart.videoToolEmitter.subscribe((event) {
      print('restart');
      //updateChrono(videoTool.restart);
    });
    controlVideoToolForwardTwo.videoToolEmitter.subscribe((event) {
      updateChrono(videoTool.forwardTwo);
    });
    controlVideoToolForwardFour.videoToolEmitter.subscribe((event) {
      updateChrono(videoTool.forwardFour);
    });
    changeCurrentEvent();
    //debugger();
    //inspect(ClickHistoryServiceDart.clickHistory);
    //inspect(currentEvent);

    ClickHistoryServiceDart.startStream();
    ClickHistoryServiceDart.startTimer();
    ClickHistoryServiceDart.incremented!.stream.listen((value) {
      print('ClickHistory time $value');
      playEvent(value);
    });
    EndGameEventDescription.endGame!.stream.listen((value) {
      openDialogEndReplay();
    });
  }

  changeCurrentEvent() {
    print('$indexEvent indexEvent before');
    if (indexEvent > ClickHistoryServiceDart.clickHistory.length) {
      print('indexEvent > ClickHistoryServiceDart.clickHistory.length');
      return;
    }
    currentEvent = ClickHistoryServiceDart.clickHistory[indexEvent];
    indexEvent++;
    print('$indexEvent indexEvent after and currentEvent ');
    lastIndex = indexEvent;
  }

  playEvent(int time) {
    while (currentEvent.time == time) {
      currentEvent.play(widget);
      changeCurrentEvent();
    }
  }

  resume() {
    widget.gameKey.currentState?.widget.chronometerKey.currentState
        ?.startTimer();
    ClickHistoryServiceDart.startTimer();
  }

  updateChrono(videoTool tool) {
    switch (tool) {
      case videoTool.play:
        print('play');
        widget.gameKey.currentState?.widget.chronometerKey.currentState
            ?.stopTimer();
        currentState = videoTool.play;
        resume();

        break;
      case videoTool.pause:
        print('pause');
        ClickHistoryServiceDart.timer?.cancel();
        widget.gameKey.currentState?.widget.chronometerKey.currentState
            ?.stopTimer();
        currentState = videoTool.pause;
        break;
      case videoTool.restart:
        print('restart');
        ClickHistoryServiceDart.stopTimer();
        restartControlBehaviour();
        resume();

        break;
      case videoTool.forwardTwo:
        print('forward two');
        ClickHistoryServiceDart.timer?.cancel();
        widget.gameKey.currentState?.widget.chronometerKey.currentState
            ?.stopTimer();
        currentState = videoTool.forwardTwo;
        widget.gameKey.currentState?.widget.chronometerKey.currentState
            ?.startTimer(duration: Duration(milliseconds: 500));
        ClickHistoryServiceDart.startTimer(50);
        break;
      case videoTool.forwardFour:
        print('forward four');
        ClickHistoryServiceDart.timer?.cancel();
        widget.gameKey.currentState?.widget.chronometerKey.currentState
            ?.stopTimer();
        currentState = videoTool.forwardTwo;
        widget.gameKey.currentState?.widget.chronometerKey.currentState
            ?.startTimer(duration: Duration(milliseconds: 250));
        ClickHistoryServiceDart.startTimer(25);
        break;
    }
  }

  restartControlBehaviour() {
    widget.gameKey.currentState?.widget.chronometerKey.currentState
        ?.stopTimer();
    widget.gameKey.currentState?.widget.chronometerKey.currentState?.start =
        widget.gameKey.currentState!.gameInfo.initialTime;
    setState(() {
      gamePage = GamePageClassic1v1(
        key: widget.gameKey,
        img1: widget.img1,
        img2: widget.img2,
        diff: widget.diff,
        isReplay: true,
      );
    });
  }

  changeTimeSlider(double value) {
    setState(() {
      this.value = value;
      ClickHistoryServiceDart.timeFraction = value as int;
      ClickHistoryServiceDart.timer?.cancel();
      widget.gameKey.currentState?.widget.chronometerKey.currentState
          ?.stopTimer();

      updateChrono(currentState);
    });
  }

  openDialogEndReplay() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(languageService.translate(
              frenchString: 'Replay terminé', englishString: 'Replay ended')),
          content: Text(languageService.translate(
              frenchString: 'Replay terminé', englishString: 'Replay ended')),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
                Navigator.of(context)
                    .push(MaterialPageRoute(builder: (context) => MainPage()));
              },
              child: Text(languageService.translate(
                  frenchString: 'Quitter', englishString: 'Quit')),
            ),
            TextButton(
                onPressed: () {
                  restartControlBehaviour();
                },
                child: Text(languageService.translate(
                    frenchString: 'Rejouer', englishString: 'Replay')))
          ],
        );
      },
    );
  }

  Future<void> saveReplay() async {
    print('saveReplay');
    print(User.id);
    final Map<String, dynamic> body = {
      'user': User.id,
      'replay': {
        'dateHeure': DateTime.now().toIso8601String(),
        'gameCardId': widget.gameKey.currentState!.gameInfo.gameCardId,
        'gameCardName': widget.gameKey.currentState!.gameInfo.gameName,
        'usernames': widget.gameKey.currentState!.playerNames,
        'saved': saved,
        'eventHistory': ClickHistoryServiceDart.clickHistory
      }
    };

    final response = await http.post(
      Uri.parse('$baseUrl/replay'),
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      },
      body: json.encode(body),
      
    );
    if (response.statusCode == 201) {
      setState(() {
        saved = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Replay Page'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Slider(
                value: value,
                onChanged: (newValue) => {changeTimeSlider(newValue)},
                max: ClickHistoryServiceDart.clickHistory.last.time.toDouble(),
                min: 0.0),

            Expanded(
              child: Row(
                children: [
                  Expanded(child: gamePage),
                ],
              ),
            ),
            //widget.gamePage,
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Spacer(),
                ControlVideo(
                  controlVideoToolPlay: controlVideoToolPlay,
                  controlVideoToolPause: controlVideoToolPause,
                  controlVideoToolRestart: controlVideoToolRestart,
                  controlVideoToolForwardTwo: controlVideoToolForwardTwo,
                  controlVideoToolForwardFour: controlVideoToolForwardFour,
                ),
                Spacer(),
                OutlinedButton(
                    onPressed: () async {
                      if (!saved) {
                        await saveReplay();
                      } else {
                        null;
                      }
                    },
                    child: Text(languageService.translate(
                        frenchString: 'Sauvegarder', englishString: 'Save'))),
                OutlinedButton(
                    onPressed: () {
                      Navigator.pop(context);
                      Navigator.of(context).push(
                          MaterialPageRoute(builder: (context) => MainPage()));
                    },
                    child: Text(languageService.translate(
                        frenchString: 'Quitter', englishString: 'Quit'))),
                Spacer(),
              ],
            )
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    print('dispose ReplayPage');
    super.dispose();
    ClickHistoryServiceDart.dispose();
    ClickHistoryServiceDart.clickHistory = [];
  }
}
