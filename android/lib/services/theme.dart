import 'package:flutter/material.dart';
import 'package:polydiff/services/http-request-tool.dart';
import 'package:polydiff/services/user.dart';

class ThemeService extends ChangeNotifier {
  static ThemeService instance = ThemeService._internal();
  bool isThemeDark = true;

  ThemeService._internal();

  factory ThemeService() {
    return instance;
  }

  ColorScheme get currentColorScheme => isThemeDark
      ? ColorScheme.dark(
          primary: Colors.white,
          surface: Color.fromARGB(255, 38, 86, 111),
          // secondary: Color.fromARGB(255, 40, 68, 83),
          secondary: Color.fromARGB(255, 38, 86, 111),
          // background: Color.fromARGB(255, 38, 86, 111),
        )
      : ColorScheme.light(
          primary: Color.fromARGB(255, 19, 85, 138),
          secondary: Color.fromARGB(255, 207, 214, 216),
          onSurface: Color.fromARGB(255, 19, 85, 138),
        );

  // changes current session display language
  setTheme(bool isDark) {
    isThemeDark = isDark;
    print('object');
    notifyListeners();
  }

  // Save current state to db
  saveTheme() {
    HttpRequestTool.basicPatch('api/fs/players/${User.username}/theme', {
      'isThemeDark': isThemeDark,
    });
  }

  // For use in user settings
  selectTheme(bool isDark) {
    setTheme(isDark);
    saveTheme();
  }
}
