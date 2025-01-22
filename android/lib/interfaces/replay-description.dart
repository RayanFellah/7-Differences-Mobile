import 'package:polydiff/interfaces/event-description.dart';

class ReplayDescritpion{
  final DateTime dateHeure;
  final String? gameCardId;
  final String? gameCardName;
  final List<String> usernames;
  final bool saved;
  final List<EventDescription> eventHistory;

  ReplayDescritpion({
    required this.dateHeure,
    required this.gameCardId,
    required this.gameCardName,
    required this.usernames,
    required this.saved,
    required this.eventHistory,
  });

  ReplayDescritpion.fromJson(Map<String, dynamic> json)
      : dateHeure = DateTime.parse(json['dateHeure']),
        gameCardId = json['gameCardId'],
        gameCardName = json['gameCardName'],
        usernames = List<String>.from(json['usernames']),
        saved = json['saved'],
        eventHistory = List<EventDescription>.from(json['eventHistory']);
}