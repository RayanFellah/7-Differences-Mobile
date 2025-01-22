class GameStats {
  List<Map<String, dynamic>> players;
  Map<String, dynamic> winner;
  int gameTime;

  GameStats({
    required this.players,
    required this.winner,
    required this.gameTime,
  });
  factory GameStats.fromMap(Map<String, dynamic> map) {
    return GameStats(
      players: List<Map<String, dynamic>>.from(
          map['players'].map((item) => Map<String, dynamic>.from(item))),
      winner: map['winner'] != null ? Map<String, dynamic>.from(map['winner']) : {},
      gameTime: map['gameTime'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'players': players,
      'winner': winner,
      'gameTime': gameTime,
    };
  }
}
