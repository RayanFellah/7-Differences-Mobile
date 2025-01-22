// ignore_for_file: file_names

import 'dart:convert';

import 'package:polydiff/services/communication.dart';
import 'package:polydiff/services/consts.dart';
import 'package:polydiff/services/interfaces/game-consts-interface.dart';

class GameConstantsService {
  int initialTime = Consts.DEFAULT_INITIAL_TIME;
  int penalty = Consts.DEFAULT_PENALTY;
  int timeWon = Consts.DEFAULT_TIME_WON;
  bool cheatMode = Consts.DEFAULT_CHEAT_MODE;

  CommunicationService communicationService = CommunicationService();

  Constants getConstants() {
    return defaultConstants();
  }

  Constants defaultConstants() {
    return Constants(
      initialTime: initialTime,
      penalty: penalty,
      timeWon: timeWon,
      cheatMode: cheatMode,
    );
  }

  Future<void> setConstants(Constants constants) async {
    initialTime = constants.initialTime;
    penalty = constants.penalty;
    timeWon = constants.timeWon;
    cheatMode = constants.cheatMode;
  }
}
