import 'package:polydiff/services/diference.dart';


enum Difficulty {
  Facile,
  Difficile,
}

extension DifficultyExtension on Difficulty {
  String get value {
    switch (this) {
      case Difficulty.Facile:
        return 'Facile';
      case Difficulty.Difficile:
        return 'Difficile';
      default:
        return '';
    }
  }
}

class GameCardTemplate {
  String? id;
  late String name;
  late Difficulty difficulty;

  late String img1ID;
  late String img2ID;
  late List<Difference> differences = [];

  GameCardTemplate({
    this.id,
    required this.name,
    required this.difficulty,
    required this.img1ID,
    required this.img2ID,
    required this.differences,
  }) {
    //initDefault();
  }

  factory GameCardTemplate.fromJson(Map<String, dynamic> json) {
    return GameCardTemplate(
      id: json['id'] as String?,
      name: json['name'] as String,
      difficulty: Difficulty.values.firstWhere(
        (e) => e.value == json['difficulty'],
        orElse: () => Difficulty.Facile, // Default value in case the difficulty is not found
      ),
      img1ID: json['img1ID'] as String,
      img2ID: json['img2ID'] as String,
      differences: (json['differences'] as List)
          .map((differenceJson) => Difference.fromJson(differenceJson))
          .toList(),
    );
  }

  void initDefault() {
    difficulty = Difficulty.Facile;
    differences = [];
  }

  bool isComplete() {
    return name.isNotEmpty &&
        difficulty != null &&
        differences.isNotEmpty;
  }
}
