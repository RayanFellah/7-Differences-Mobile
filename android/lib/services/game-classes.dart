enum GameMode {
  classiqueSolo,
  classique1v1,
  tempsLimite,
  tempsLimiteCoop,
}

extension GameModeExtension on GameMode {
  String get value {
    switch (this) {
      case GameMode.classiqueSolo:
        return 'Classique solo';
      case GameMode.classique1v1:
        return 'Classique 1v1';
      case GameMode.tempsLimite:
        return 'Temps limité';
      case GameMode.tempsLimiteCoop:
        return 'Temps limité coop';
      default:
        return '';
    }
  }
}

class GameEnded {
  DateTime startDate;
  int duration;
  GameMode gameMode;
  String player1;
  String player2;
  bool quit;
  bool quitCoop;

  GameEnded({
    required this.startDate,
    required this.duration,
    required this.gameMode,
    required this.player1,
    this.player2 = "",
    this.quit = false,
    this.quitCoop = false,
  });
}

class NewTime {
  GameMode gameMode;
  int duration;
  String player;
  String gameCardId;

  NewTime({
    required this.gameMode,
    required this.duration,
    required this.player,
    required this.gameCardId,
  });

  factory NewTime.fromJson(Map<String, dynamic> json) {
    return NewTime(
      gameMode: parseGameMode(json['gameMode'] as String),
      duration: json['duration'] as int,
      player: json['player'] as String,
      gameCardId: json['gameCardId'] as String,
    );
  }
}

GameMode parseGameMode(String mode) {
  return GameMode.values.firstWhere(
    (e) => e.value == mode,
    orElse: () => throw Exception('Unknown game mode: $mode'),
  );
}

class Constants {
  final int initialTime;
  final int penalty;
  final int timeWon;

  const Constants({
    required this.initialTime,
    required this.penalty,
    required this.timeWon,
  });
}
