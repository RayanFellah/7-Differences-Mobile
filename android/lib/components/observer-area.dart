import 'dart:async';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:polydiff/services/consts.dart';
import 'package:polydiff/services/socket.dart';

class ObserverArea extends StatefulWidget {
  final bool isObserver;
  final Color observerColor;
  final String playerNumber;

  const ObserverArea({
    Key? key,
    required this.isObserver,
    required this.observerColor,
    required this.playerNumber,
  }) : super(key: key);

  @override
  _ObserverAreaState createState() => _ObserverAreaState();
}

class _ObserverAreaState extends State<ObserverArea> {
  final List<Rectangle> _rectangles = [];
  bool _canDraw = true;  

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: widget.isObserver && _canDraw ? _onPanStart : null,
      onPanUpdate: widget.isObserver && _canDraw ? _onPanUpdate : null,
      onPanEnd: widget.isObserver && _canDraw ? _onPanEnd : null,
      child: CustomPaint(
        painter: _ObserverAreaPainter(
            rectangles: _rectangles, observerColor: widget.observerColor),
        child: SizedBox(
          width: Consts.IMAGE_WIDTH.toDouble(),
          height: Consts.IMAGE_HEIGHT.toDouble(),
        ),
      ),
    );
  }

  void _onPanStart(DragStartDetails details) {
    final position = details.localPosition;
    setState(() {
      _rectangles.add(
        Rectangle(
          start: position,
          end: position,
          color: widget.observerColor,
        ),
      );
    });
  }

 void _onPanUpdate(DragUpdateDetails details) {
  final RenderBox renderBox = context.findRenderObject() as RenderBox;
  Offset localPosition = renderBox.globalToLocal(details.globalPosition);
  
  double clampedX = localPosition.dx.clamp(0, Consts.IMAGE_WIDTH.toDouble());
  double clampedY = localPosition.dy.clamp(0, Consts.IMAGE_HEIGHT.toDouble());
  final updatedPosition = Offset(clampedX, clampedY);

    setState(() {
      final rect = _rectangles.last;
      rect.end = updatedPosition; 
    });

  }

  void _onPanEnd(DragEndDetails details) {
    final rect = _rectangles.last;
    print('widget player no: ${widget.playerNumber}');
    int playerNumberToSend = _getPlayerNumberFromSelection(widget.playerNumber);
    bool broadcast = playerNumberToSend == 5;  // broadcast if all players are selected
    Map<String, dynamic> region = {
      'startX': rect.start.dx,
      'startY': rect.start.dy,
      'endX': rect.end.dx,
      'endY': rect.end.dy
    };

    SocketService.socket.emit('observerRectangleTransfer', {
      'region': region,
      'broadcast': broadcast, 
      'playerNumber': broadcast ? null : playerNumberToSend,
      'color': rect.color.value.toString()
    });

    _canDraw = false;  

    Timer(Duration(seconds: 3), () {
        if (mounted) {
      setState(() { 
        _rectangles.removeLast();
        _canDraw = true;
      });
    }
    });
  }

  int _getPlayerNumberFromSelection(String selection) {
    switch (selection) {
      case 'player1': return 0;
      case 'player2': return 1;
      case 'player3': return 2;
      case 'player4': return 3;
      case 'all': return 5;
      default: return 5;
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.isObserver) {
      _listenForRectangles();
    }
  }

  void _listenForRectangles() {
    SocketService.socket.on('rectangleTransfer', (data) {
      if (data != null && data is Map) {
        setState(() {
          final startX = data['region']['startX']?.toDouble();
          final startY = data['region']['startY']?.toDouble();
          final endX = data['region']['endX']?.toDouble();
          final endY = data['region']['endY']?.toDouble();
          final colorValue = int.tryParse(data['color'].toString()) ?? 0xFFFFFF;

          if (startX != null && startY != null && endX != null && endY != null) {
            final start = Offset(startX, startY);
            final end = Offset(endX, endY);
            final color = Color(colorValue);
            _rectangles.add(Rectangle(start: start, end: end, color: color));
          }
        });
      }
    });
  }
}

class Rectangle {
  Offset start;
  Offset end;
  Color color;

  Rectangle({required this.start, required this.end, required this.color});
}

class _ObserverAreaPainter extends CustomPainter {
  final List<Rectangle> rectangles;
  final Color observerColor;

  _ObserverAreaPainter({required this.rectangles, required this.observerColor});

  @override
  void paint(ui.Canvas canvas, ui.Size size) {
    for (var rectangle in rectangles) {
      final paint = Paint()
        ..color = rectangle.color
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0;
      canvas.drawRect(Rect.fromPoints(rectangle.start, rectangle.end), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
