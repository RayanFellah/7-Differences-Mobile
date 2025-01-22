import 'dart:async';
import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:polydiff/interfaces/vec2.dart';
import 'package:polydiff/services/click-history.dart';
import 'package:polydiff/services/consts.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/difference-detection-service.dart';
import 'package:polydiff/services/replay-service.dart';

// ignore: must_be_immutable
class PlayAreaWidget extends StatefulWidget {
  final Uint8List img;
  List<Difference>? diff;
  Offset? lastPosition;
  
  //observer
  bool? isObserver;


  bool showError = false;
  final bool isReplay;

  PlayAreaWidget(
      {Key? key, required this.img, this.diff, required this.isReplay, this.isObserver})
      : super(key: key);

  @override
  PlayAreaWidgetState createState() => PlayAreaWidgetState();
}

class PlayAreaWidgetState extends State<PlayAreaWidget> {
  Offset lastPosition = Offset(0, 0);
  List<Difference>? _foundDifferences;
  final DifferencesDetectionService differencesDetectionService =
      DifferencesDetectionService();

  final ReplayService replayService = ReplayService();


  @override
  void initState() {
    super.initState();
    print(
        '${ClickHistoryServiceDart.timeFraction} timeFraction PlayAreaWidget');
    // differencesDetectionService.showErrorController.stream.listen((showError) {
    //   if (showError) {
    //     print('showError');
    //     showErrorForOneSecond(showError);
    //   }
    // });
    // print('${widget.diff} diffs in playArea');
    _loadImage(widget.img);
  }



  Future<ui.Image?> _loadImage(Uint8List imgBytes) async {
    if (imgBytes == null || imgBytes.isEmpty) {
      print('Image data is null or empty');
      return null;
    }

    try {
      final codec = await ui.instantiateImageCodec(imgBytes);
      final frame = await codec.getNextFrame();
      return frame.image;
    } catch (e) {
      print('Failed to load image: $e');
      return null;
    }
  }

  void clickHandle(TapDownDetails details) {
    //observer
     if (widget.isObserver == true && widget.isReplay) {
      return;
    }

    final RenderBox renderBox = context.findRenderObject() as RenderBox;
    this.lastPosition = renderBox.globalToLocal(details.globalPosition);

      print(
          'Position du clic: ${this.lastPosition.dx}, ${this.lastPosition.dy}');

      // print('Differences dans clickHandle de PA: ${widget.diff}');

      replayService.addClickEventReplay(
          Vec2(this.lastPosition.dx, this.lastPosition.dy));
      // Supposons que votre service soit accessible et ait une fonction similaire
      differencesDetectionService.mouseHitDetect(
          this.lastPosition.dx, this.lastPosition.dy, widget.diff);
    }
  

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ui.Image?>(
      future: _loadImage(widget.img), // Create a new Future on each build
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          if (snapshot.data != null) {
            return GestureDetector(
              onTapDown: clickHandle,
              child: CustomPaint(
                painter: _PlayAreaPainter(
                    image: snapshot.data!,
                    differences: _foundDifferences,
                    lastPosition: lastPosition,
                    showError: widget.showError),
                child: SizedBox(
                  width: Consts.IMAGE_WIDTH.toDouble(),
                  height: Consts.IMAGE_HEIGHT.toDouble(),
                ),
              ),
            );
          } else {
            // Display an error message if the image could not be loaded
            return Center(
              child: Text(''),
            );
          }
        } else {
          return Center(
            child: Text(''),
          );
        }
      },
    );
  }

  @override
  void dispose() {
    super.dispose();
    replayService.dispose();

    print(
        '${ClickHistoryServiceDart.timeFraction} timeFraction PlayAreaWidget dispose');
  }
}

class _PlayAreaPainter extends CustomPainter {
  final ui.Image image;
  final List<Difference>? differences;
  late bool showError;
  late Offset? lastPosition;
  _PlayAreaPainter({
    required this.image,
    this.differences,
    this.lastPosition,
    this.showError = false,
  });

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawImage(image, Offset.zero, Paint());
    // if (showError && lastPosition != null) {
    //   print('yes');
    //   final textStyle = TextStyle(
    //     color: Colors.red,
    //     fontSize: 20,
    //   );
    //   final textSpan = TextSpan(
    //     text: 'Error',
    //     style: textStyle,
    //   );
    //   final textPainter = TextPainter(
    //     text: textSpan,
    //     textDirection: TextDirection.ltr,
    //   );
    //   textPainter.layout(
    //     minWidth: 0,
    //     maxWidth: size.width,
    //   );
    //   textPainter.paint(canvas, lastPosition ?? offset);
    //   final offset = Offset(size.width / 2, size.height / 2);
    // }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
