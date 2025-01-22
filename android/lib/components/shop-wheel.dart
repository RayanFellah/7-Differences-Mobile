import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:polydiff/services/items.dart';
import 'package:polydiff/services/user.dart';

class Wheel extends StatelessWidget {
  final double angle;
  final List<String> items;

  const Wheel({Key? key, required this.angle, required this.items})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 300,
      height: 300,
      child: CustomPaint(
        painter: WheelPainter(angle: angle, items: items),
      ),
    );
  }
}

class WheelPainter extends CustomPainter {
  final double angle;
  final List<String> items;
  WheelPainter({required this.angle, required this.items});

  @override
  void paint(Canvas canvas, Size size) {
    var paint = Paint()..style = PaintingStyle.fill;

    final rect = Rect.fromLTWH(0, 0, size.width, size.height);
    final center = Offset(size.width / 2, size.height / 2);
    final radius = math.min(size.width / 2, size.height / 2);

    for (int i = 0; i < items.length; i++) {
      final currentAngle = (2 * math.pi / items.length) * i + angle;
      if (i == 3) {
        paint.color = Colors.red;
      } else {
        paint.color = Colors.black;
        }

      canvas.drawArc(
          rect, currentAngle, 2 * math.pi / items.length, true, paint);

      // Draw text
      final textSpan = TextSpan(
        text: items[i],
        style: TextStyle(color: Colors.white, fontSize: 14),
      );
      final textPainter = TextPainter(
        text: textSpan,
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();
      final x =
          (radius - 30) * math.cos(currentAngle + math.pi / items.length) +
              center.dx;
      final y =
          (radius - 30) * math.sin(currentAngle + math.pi / items.length) +
              center.dy;
      textPainter.paint(canvas,
          Offset(x - textPainter.width / 2, y - textPainter.height / 2));
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class WheelPage extends StatefulWidget {
  @override
  _WheelPageState createState() => _WheelPageState();
}

class _WheelPageState extends State<WheelPage>
    with SingleTickerProviderStateMixin {
  late AnimationController controller;
  late Animation<double> animation;
  final ItemService itemService = ItemService();
  final List<String> items = [
    'Rien',
    'Rien',
    'Rien',
    'Multiplicateur x2',
    'Rien',
    'Rien',
    'Rien',
    'Rien'
  ];
  String result = '';

  @override
  void initState() {
    super.initState();
    controller = AnimationController(
      duration: const Duration(seconds: 5),
      vsync: this,
    );

    final random = math.Random();
    final numberOfSpins = random.nextInt(5) +
        3; // Au moins 3 tours complets pour un bon effet de spin
    // Calculez l'angle pour chaque segment
    final anglePerItem = (2 * math.pi) / items.length;
    // Ajoutez un angle aléatoire pour tomber sur n'importe quel segment
    final randomAngle = random.nextInt(items.length) * anglePerItem;
    final endAngle = numberOfSpins * 2 * math.pi + randomAngle;

    animation = Tween<double>(begin: 0, end: endAngle)
        .animate(CurvedAnimation(parent: controller, curve: Curves.decelerate))
      ..addListener(() {
        setState(() {});
      })
      ..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          showResult();
        }
      });
  }

  //   buySpinWheelTurn(hasWonGameMultiplier: boolean) {
  //   const body = { spinResult: hasWonGameMultiplier }
  //   return this.http.put(`${this.baseUrl}/api/fs/players/${this.currentUser?.username}/spin-wheel`, body, {
  //     observe: 'response',
  //     responseType: 'json'
  //   });
  // }

  Future<void> buySpinWheelTurn(bool hasWonGameMultiplier) async {
    print('hereee');
    final body = {'spinResult': hasWonGameMultiplier.toString()};
    await http.put(
      Uri.parse(
          '${dotenv.env['SERVER_URL_AND_PORT']!}api/fs/players/${User.username}/spin-wheel'),
      body: body,
    );
  }

  void spinWheel() {
    if (User.dinarsAmount < 5) return;
    if (controller.isAnimating) return;

    controller.reset();
    controller.forward();
  }

  void showResult() {
    final angle = animation.value % (2 * math.pi);
    final segmentSize = 2 * math.pi / items.length;
    final index = (angle / segmentSize).floor();
    setState(() {
      result = items[index];
    });
    buySpinWheelTurn(result == 'Multiplicateur x2');
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Résultat'),
          content: result == 'Rien'
              ? Text("Désolé, vous n'avez rien gagné")
              : Text('Bravo, vous avez gagné un multiplicateur de points!'),
          actions: [
            TextButton(
              child: Text('OK'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    ).then((_) {
      // Navigator.push(
      //   context,
      //   MaterialPageRoute(
      //       builder: (context) =>
      //           ShopPage()), // Replace NewPage with the desired page
      // );
      Navigator.of(context).pop();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Stack(
              alignment: Alignment.topCenter,
              children: [
                Wheel(angle: animation.value, items: items),
                Positioned(
                  top:
                      130, // Ajustez cette valeur selon la taille de votre roue
                  child: Icon(Icons.arrow_drop_up, size: 50, color: Colors.red),
                ),
              ],
            ),
            ElevatedButton(
              onPressed: spinWheel,
              child: Text('Tourner la Roue'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}
