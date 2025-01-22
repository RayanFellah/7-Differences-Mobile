import 'dart:async';

import 'package:audioplayers/audioplayers.dart';
import 'package:polydiff/interfaces/vec2.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/socket.dart';
import 'package:polydiff/services/user.dart';

class DifferencesDetectionService {
  final AudioPlayer audioPlayer = AudioPlayer();
  final StreamController<int> _countController =
      StreamController<int>.broadcast();
  Stream<int> get countStream => _countController.stream;

  StreamController<bool> showErrorController = StreamController<bool>.broadcast();
  int _count = 0;

  final StreamController<List<Difference>?> _differenceController =
      StreamController<List<Difference>?>.broadcast();
  Stream<List<Difference>?> get differenceStream =>
      _differenceController.stream;

  final StreamController<List<Difference>?> _foundController =
      StreamController<List<Difference>?>.broadcast();
  Stream<List<Difference>?> get foundStream => _foundController.stream;

  Vec2 _mousePosition = Vec2(0, 0);
  final StreamController<Vec2> _mousePositionController =
      StreamController<Vec2>.broadcast();
  Stream<Vec2> get mousePositionStream => _mousePositionController.stream;

  final StreamController<bool> _validationController =
      StreamController<bool>.broadcast();
  Stream<bool> get validationStream => _validationController.stream;

  // final SocketService socketService;

  // Singleton instance
  static final DifferencesDetectionService _instance =
      DifferencesDetectionService._internal();

  // Factory constructor
  factory DifferencesDetectionService() {
    return _instance;
  }

  // Private constructor
  DifferencesDetectionService._internal() {
    print('hereee');
    _initialize();
  }

  // Initialization method
  void _initialize() {
    showErrorController.add(false);
    SocketService.socket.on('validation', (response) {
      bool validation = response['validation'];
      print('here in validation');
      _validationController.add(validation);
      if (validation) {
        print('validated $response');
        _count += 1;
        _countController.add(_count);
        playSuccessSound();
        List<Difference> newDiffs = (response['diff'] as List)
            .map((item) => Difference.fromJson(item))
            .toList();
        _differenceController.add(newDiffs);
        _foundController.add((response['diffFound'] as List)
            .map((item) => Difference.fromJson(item))
            .toList());
        print('found ${response['diffFound']}');
      } else {
        // draw error message en rouge pendant 1 seconde sur le canvas de playArea
        showErrorController.add(true);
        playErrorSound();
      }
    });
  }

  void resetFound() {
    _foundController.add([]);
  }

  void resetCount() {
    _count = 0;
    _countController.add(_count);
  }

  void mouseHitDetect(double x, double y, List<Difference>? diffArray) {
    _mousePosition = Vec2(x, y);
    _mousePositionController.add(_mousePosition);
    print('diffArray: $diffArray');
    final ioObj = {
      'pos': {
        'x': _mousePosition.x.round(),
        'y': _mousePosition.y.round()
      }, // Convertir Vec2 en Map
      'diff': diffArray
          ?.map((diff) => diff.toJson())
          .toList(), // Assurez-vous que les objets Difference sont également convertibles en JSON
    };
    print('emit');
    SocketService.socket.emit('click', ioObj);
  }

  void setDifference(List<Difference>? diff) {
    print('difference in setDifference: $diff');
    _differenceController.add(diff);
  }

  void playErrorSound() async {
    print('play error sound');
    final String audioPath = User.specialErrorSoundUsed
        ? 'special-audios/fail-sound.mp3'
        : 'audios/error.mp3';

    await audioPlayer.play(AssetSource(audioPath));
  }

  void playSuccessSound() async {
    final String audioPath = User.specialSuccessSoundUsed
        ? 'special-audios/success-sound.mp3'
        : 'audios/success.mp3';

    await audioPlayer.play(AssetSource(audioPath));
  }

  void dispose() {
    _countController.close();
    _differenceController.close();
    _foundController.close();
    _mousePositionController.close();
    _validationController.close();
  }
}
