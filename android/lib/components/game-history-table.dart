import 'package:polydiff/components/generic-history-table.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/user.dart';

class GameHistoryTable extends GenericHistoryTable {
  GameHistoryTable()
      : super(
            data: User.gameHistory.map((entry) {
              return MapEntry(entry.date, entry.wonGame == true ? '👑' : '❌');
            }).toList(),
            dataLabel: LanguageService().translate(
                frenchString: 'Partie gagnée', englishString: 'Game won'));
}
