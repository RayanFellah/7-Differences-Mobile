import 'dart:async';

import 'package:polydiff/services/diference.dart';

class BlinkerService {
  final _isBlinkingController = StreamController<bool>.broadcast();
  
  
  Stream<bool> get isBlinkingStream => _isBlinkingController.stream;
  // Fonction pour initier le clignotement
  void blinkPixels(List<Difference> differences, {required Function(bool) onBlink}) {
    bool isBlinking = true;
    int count = 0;
    const int maxCount = 10;

    Timer.periodic(const Duration(milliseconds: 10000), (timer) {
      // Mise à jour du statut de clignotement
      _isBlinkingController.add(isBlinking);
      onBlink(isBlinking);

      isBlinking = !isBlinking;
      count++;

      if (count >= maxCount) {
        timer.cancel();
        _isBlinkingController.add(false);
        onBlink(false);
      }
    });
  }

  void dispose() {
    _isBlinkingController.close();
  }
}

