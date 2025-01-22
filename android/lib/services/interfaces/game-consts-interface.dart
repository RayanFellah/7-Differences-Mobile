class Constants {
  final int initialTime;
  final int penalty;
  final int timeWon;
  final bool cheatMode;

  Constants({
    required this.initialTime,
    required this.penalty,
    required this.timeWon,
    required this.cheatMode,
  });

  factory Constants.fromJson(Map<String, dynamic> json) {
    return Constants(
      initialTime: json['initialTime'] as int,
      penalty: json['penalty'] as int,
      timeWon: json['timeWon'] as int,
      cheatMode: json['cheatMode'] as bool,
    );
  }
}
