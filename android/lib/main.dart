import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:polydiff/pages/home-page.dart';
import 'package:polydiff/services/camera.dart';
import 'package:polydiff/services/current-game.dart';
import 'package:polydiff/services/game-info.dart';
import 'package:polydiff/services/image-from-server.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/localNotificationService.dart';
import 'package:polydiff/services/socket.dart';
import 'package:polydiff/services/theme.dart';
import 'package:provider/provider.dart';

GameInfoService gameInfoService = GameInfoService();
CurrentGameService currentGameService = CurrentGameService();

// modif test
Future main() async {
  // Toggle this line to switch between dev and prod
  await dotenv.load(fileName: 'env/.env.prod');

  SocketService.socket.on('PlayerNumber', (res) {
    if (res != -1) {
      print('PlayerNumber: $res');
      gameInfoService.playerNo = res;
    }
  });

  SocketService.socket.on('ClassicConstants', (res) {
    print('ClassicConstants: $res');
    gameInfoService.initialTime = res['initialTime'];
    gameInfoService.cheatMode = res['cheatMode'];
  });

  SocketService.socket.on('Constants', (res) {
    print('Constants: $res');
    gameInfoService.initialTime = res['initialTime'];
    gameInfoService.penalty = res['penalty'];
    gameInfoService.timeWon = res['timeWon'];
    gameInfoService.cheatMode = res['cheatMode'];
    gameInfoService.maxTime = res['maxTime'];
  });

  SocketService.socket.on('Players', (res) {
    print('PlayerNames: $res');
    if (res != null) {
      List<String> stringList =
          List<String>.from(res.map((item) => item.toString()));
      gameInfoService.playerNames = stringList;
      // playerNamesController.add(stringList);
      print('Updated player names: ${gameInfoService.playerNames}');
    }
  });

    SocketService.socket.on('End', (res) {
      try {
        currentGameService.winner = res['winner'];
      } catch (e) {
        currentGameService.winner = res;
      }

      currentGameService.endGame = [true, false];
      // _endGameController.add(_endGame);
      print('ended $res');
    });

  SocketService.socket.on('diffFound', (res) {
    print('here in diffFound');
    if (res != null && res['counters'] != null) {
      List<int> newCounts = List<int>.from(res['counters']);
      print('$newCounts newCounts');
      // Mettez à jour les compteurs des joueurs avec les nouvelles valeurs
      gameInfoService.playerCounts = newCounts;
      // Notifiez les écouteurs du stream des compteurs des joueurs avec les nouvelles valeurs
      print('Updated player counts: $newCounts');
    }
  });
  WidgetsFlutterBinding.ensureInitialized();
  await Camera.initialize();
  await LocalNotificationService().init();
  SocketService.initSocket();

  SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: []);
  SystemChrome.setPreferredOrientations([DeviceOrientation.landscapeLeft])
      .then((_) {
    runApp(
      ChangeNotifierProvider(
          create: (context) => AvatarProvider(), child: App()),
    );
  });
}

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
        create: (context) => AppState(),
        child: Consumer<AppState>(
          builder: (context, appState, child) => Container(
            decoration: BoxDecoration(
              image: DecorationImage(
                image: AssetImage(appState.themeService.isThemeDark
                    ? 'assets/images/background.png'
                    : 'assets/images/background_light.png'),
                fit: BoxFit.cover,
              ),
            ),
            child: MaterialApp(
              locale: appState.languageService.currentLocale,
              localizationsDelegates: [
                GlobalMaterialLocalizations.delegate,
                GlobalWidgetsLocalizations.delegate,
                GlobalCupertinoLocalizations.delegate,
              ],
              supportedLocales: [
                const Locale('en', ''), // English
                const Locale('fr', ''), // French
              ],
              title: 'PolyDiff',
              theme: ThemeData(
                useMaterial3: true,
                colorScheme: appState.themeService.currentColorScheme,
                scaffoldBackgroundColor: Colors.transparent,
              ),
              home: HomePage(),
            ),
          ),
        ));
  }
}

class AppState extends ChangeNotifier {
  ThemeService themeService = ThemeService();
  LanguageService languageService = LanguageService();

  AppState() {
    themeService.addListener(updateTheme);
    languageService.addListener(updateLanguage);
  }

  void updateTheme() {
    notifyListeners();
  }

  void updateLanguage() {
    notifyListeners();
  }

  @override
  void dispose() {
    themeService.removeListener(updateTheme);
    languageService.removeListener(updateLanguage);
    super.dispose();
  }
}
