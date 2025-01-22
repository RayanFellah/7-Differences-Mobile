class Difference {
  List<int> points;

  Difference({required this.points});

  factory Difference.fromJson(Map<String, dynamic> json) {
    // S'assurer que la clé 'points' dans la map JSON est une liste d'entiers
    var pointsFromJson = json['points'];
    if (pointsFromJson is! List) {
      throw Exception('The provided points are not in a list format.');
    }

    List<int> pointsList = List<int>.from(pointsFromJson.map((point) => point as int));

    return Difference(points: pointsList);
  }

  // Méthode toJson pour convertir l'objet Difference en Map
  Map<String, dynamic> toJson() {
    return {
      'points': points,
    };
  }
}
