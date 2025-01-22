import 'package:flutter/material.dart';
import 'package:polydiff/services/http-request-tool.dart';
import 'package:polydiff/services/user.dart';

class LanguageService extends ChangeNotifier {
  static LanguageService instance = LanguageService._internal();
  bool isLanguageFrench = true;
  Locale currentLocale = Locale('fr', 'FR');
  LanguageService._internal();

  factory LanguageService() {
    return instance;
  }

  // changes current session display language
  setLanguage(bool isFrench) {
    isLanguageFrench = isFrench;
    currentLocale = isFrench ? Locale('fr', 'FR') : Locale('en', 'US');
    notifyListeners();
  }

  // Save current state to db
  saveLanguage() {
    HttpRequestTool.basicPatch('api/fs/players/${User.username}/language', {
        'isLanguageFrench': isLanguageFrench,
    });
  }

  selectLanguage(bool isFrench) {
    setLanguage(isFrench);
    saveLanguage();
  }

  translate({required String frenchString, required String englishString}) {
    return isLanguageFrench ? frenchString : englishString;
  }
}
