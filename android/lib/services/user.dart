import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:polydiff/components/user-avatar.dart';
import 'package:polydiff/interfaces/click-event-description.dart';
import 'package:polydiff/interfaces/counter-event-description.dart';
import 'package:polydiff/interfaces/end-game-event-description.dart';
import 'package:polydiff/interfaces/event-description.dart';
import 'package:polydiff/interfaces/observer-event-description.dart';
import 'package:polydiff/interfaces/replay-description.dart';
import 'package:polydiff/services/click-history.dart';
import 'package:polydiff/services/http-request-tool.dart';
import 'package:polydiff/services/image-from-server.dart';
import 'package:polydiff/services/language.dart';

class User {
  static String username = '';
  static late String id;
  static final StreamController<String> _usernameController =
      StreamController<String>.broadcast();
  static late String avatarFileName;
  static int dinarsAmount = 0;
  static late Container avatar;
  static late Container customAvatar;
  static late List<ConnectionHistoryEntry> connectionHistory;
  static late List<String> chatNameList;

  static late List<GameHistoryEntry> gameHistory;
  static late int totalPlayedGames;
  static late int totalWonGames;
  static late int avgFoundDifferencePerGame;
  static late int avgGameDuration;

  static List<ReplayEntry> replayHistory = [];

  static bool specialErrorSoundUsed = false;
  static bool specialSuccessSoundUsed = false;

  static String get _username => username;
  static set _username(String value) {
    username = value;
    _usernameController.sink.add(username);
  }

  static StreamController<ReplayDescritpion>? replayStart = StreamController<ReplayDescritpion>.broadcast();

  static Stream<String> get usernameStream => _usernameController.stream;

  static dispose() {
    _usernameController.close();
    replayStart!.close();
  }

  static loadData() async {
    await loadConnectionHistory();
    await loadGameHistory();
    await loadReplayHistory();
  }

  // This refreshed the users avatar from server information.
  static setAvatar(String avatarFileName) {
    User.avatarFileName = avatarFileName;
    User.avatar = AvatarImageFromServer.getAvatar(avatarFileName);
  }

  // transparent wether the user uses a custom avatar or a pre-defined.
  static Container getAvatar() {
    avatar = AvatarImageFromServer.getAvatar(avatarFileName);
    return avatar;
  }

  // To avoid lag when picture just has been taken, provide the local file wich was just taken. Otherwise, always load from server.
  static Container getCustomAvatar({File? file}) {
    if (file != null) {
      customAvatar = UserAvatar.customAvatar(Image.file(file));
    } else {
      customAvatar = AvatarImageFromServer.customAvatar('pictures/$username');
    }
    return customAvatar;
  }

  static loadConnectionHistory() async {
    var res = await HttpRequestTool.basicGet(
        'api/fs/players/$username/connection-history');
    connectionHistory = [];
    if (res.statusCode == 200) {
      for (var entry in jsonDecode(res.body)['connectionHistory']) {
        connectionHistory.add(ConnectionHistoryEntry(
          date: DateTime.parse(entry['date']),
          action: entry['action'],
        ));
      }
    }
  }

  static loadGameHistory() async {
    var res =
        await HttpRequestTool.basicGet('api/fs/players/$username/game-history');
    if (res.statusCode == 200) {
      gameHistory = [];
      var history = jsonDecode(res.body)['gameHistory'];
      for (var entry in history) {
        gameHistory.add(GameHistoryEntry(
          date: DateTime.parse(entry['date']),
          wonGame: entry['wonGame'],
        ));
      }
      totalPlayedGames = gameHistory.length;
      totalWonGames = gameHistory.where((game) => game.wonGame == true).length;

      res = await HttpRequestTool.basicGet('api/fs/players/$username/averages');
      if (res.statusCode == 200) {
        var avgDiff = jsonDecode(res.body)['averageDifferencePerGame'];
        var avgTime = jsonDecode(res.body)['averageTimePerGame'];
        avgFoundDifferencePerGame =
            avgDiff is double ? avgDiff.toInt() : avgDiff;
        avgGameDuration = avgTime is double ? avgTime.toInt() : avgTime;
      }
    }
  }

  static loadReplayHistory() async {
    var res = await HttpRequestTool.basicGet('api/fs/players/$id/replay');
    if (res.statusCode == 200) {
      replayHistory = [];
      var history = jsonDecode(res.body)['replays'];
      for (var entry in history) {
        replayHistory.add(ReplayEntry(
            dateHeure: DateTime.parse(entry['dateHeure']),
            action: <Widget>[
              TextButton(
                  onPressed: () {
                    print('clicked');
                    List<EventDescription> eventHistory = [];
                    for(int i= 0; i<entry['eventHistory'].length; i++){
                        if(entry['eventHistory'][i]['x'] != null && entry['eventHistory'][i]['y'] != null){
                          eventHistory.add(clickEventDescription.fromJson(entry['eventHistory'][i]));
                        } else if(entry['eventHistory'][i]['rectangle'] != null && entry['eventHistory'][i]['color'] != null){
                          eventHistory.add(ObserverEventDescription.fromJson(entry['eventHistory'][i]));
                        } else if(entry['eventHistory'][i]['userCounter'] != null){
                          eventHistory.add(CounterEventDescription.fromJson(entry['eventHistory'][i]));
                        } else {
                          eventHistory.add(EndGameEventDescription.fromJson(entry['eventHistory'][i]));
                        }
                    }
                    ReplayDescritpion replay= ReplayDescritpion(
                      dateHeure: DateTime.parse(entry['dateHeure']),
                      gameCardId: entry['gameCardId'],
                      gameCardName: entry['gameCardName'],
                      usernames: List<String>.from(entry['usernames']),
                      saved: entry['saved'],
                      eventHistory: eventHistory
                    );
                    playReplay(replay);
                  },
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all(Colors.green),
                  ),
                  child: Text(LanguageService.instance.translate(
                      frenchString: "Visionner", englishString: "Watch")) // ButtonStyle
                  ),
              TextButton(
                  onPressed: () async {
                    await deleteReplay(entry['dateHeure']);
                    await loadReplayHistory();
                  },
                  style: ButtonStyle(
                    backgroundColor: MaterialStateProperty.all(Colors.red),
                  ),
                  child: Text(LanguageService.instance.translate(
                      frenchString: "Effacer",
                      englishString: "Delete")) // ButtonStyle
                  ),
            ]));
      }
    }
  }

  static playReplay(ReplayDescritpion replay) {
    for (int i = 0; i < replay.eventHistory.length; i++) {
      if (replay.eventHistory[i].x != null &&
          replay.eventHistory[i].y != null) {
        clickEventDescription event = clickEventDescription(
            replay.eventHistory[i].time,
            replay.eventHistory[i].x!,
            replay.eventHistory[i].y!);
        ClickHistoryServiceDart.clickHistory.add(event);
      } else if (replay.eventHistory[i].rectangle != null &&
          replay.eventHistory[i].color != null) {
        ObserverEventDescription event = ObserverEventDescription(
            replay.eventHistory[i].time,
            replay.eventHistory[i].rectangle!,
            replay.eventHistory[i].color!);
        ClickHistoryServiceDart.clickHistory.add(event);
      } else if (replay.eventHistory[i].userCounter != null) {
        CounterEventDescription event = CounterEventDescription(
            replay.eventHistory[i].time, replay.eventHistory[i].userCounter!);
        ClickHistoryServiceDart.clickHistory.add(event);
      } else {
        EndGameEventDescription event =
            EndGameEventDescription(replay.eventHistory[i].time);
        ClickHistoryServiceDart.clickHistory.add(event);
      }
    }
    replayStart!.add(replay);
  }

  static Future<void> deleteReplay(String dateHeure) async {
    var res = await http.delete(Uri.parse(
        '${dotenv.env['SERVER_URL_AND_PORT']}api/fs/players/$id/replay/$dateHeure'));
    if (res.statusCode == 200) {
      replayHistory.removeWhere((entry) => (entry.dateHeure == dateHeure));
    }
  }
}

class ConnectionHistoryEntry {
  final DateTime date;
  final String action;
  ConnectionHistoryEntry({required this.date, required this.action});
}

class GameHistoryEntry {
  final DateTime date;
  final bool wonGame;
  GameHistoryEntry({required this.date, required this.wonGame});
}

class ReplayEntry {
  final DateTime dateHeure;
  final List<Widget> action;
  ReplayEntry({required this.dateHeure, required this.action});
}
