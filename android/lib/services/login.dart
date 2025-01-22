import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/socket.dart';
import 'package:polydiff/services/theme.dart';
import 'package:polydiff/services/user.dart';

class LoginService {
  static Future<http.Response> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('${dotenv.env['SERVER_URL_AND_PORT']!}api/fs/players/login'),
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
      body: jsonEncode(<String, String>{
        'username': username,
        'password': password,
      }),
    );
    if (response.statusCode == 200) {
      var body =  jsonDecode(response.body);
      ThemeService().setTheme(body['isThemeDark']);
      LanguageService().setLanguage(body['isLanguageFrench']);
      loadUserInfo(
        username,
        body['avatar'],
        body['dinars'],
        List<Map<String, dynamic >>.from(body['channelsAndMuted']),
        body['id']
        );
    }
    return response;
  }

  static loadUserInfo(String username, String avatar, int dinars, List<Map<String, dynamic >> channelsAndMuted, String id) {
    User.username = username;
    User.id = id;
    User.setAvatar(avatar);
    User.dinarsAmount = dinars;
    User.chatNameList = List<String>.from(channelsAndMuted.map((e) => e['channelName']));
    SocketService.socket.emit('attachSocketToActiveUser', username);
    SocketService.startConnectionPing();
    User.loadData();
  }

  static Future<int> logout() async {
    String url =
        '${dotenv.env['SERVER_URL_AND_PORT']!}api/fs/players/${User.username}/logout';
    final response = await http.patch(
      Uri.parse(url),
    );
    if (response.statusCode == 200) {
      SocketService.stopConnectionPing();
      SocketService.resetSocket();
    }
    return response.statusCode;
  }
}
