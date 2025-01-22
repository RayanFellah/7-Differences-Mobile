import 'package:flutter/material.dart';
import 'package:polydiff/components/limited-selecto.dart';
import 'package:polydiff/components/message-sidebar.dart';
import 'package:polydiff/components/user-settings-button.dart';
import 'package:polydiff/pages/home-page.dart';
import 'package:polydiff/pages/selecto-page.dart';
import 'package:polydiff/pages/shop-page.dart';
import 'package:polydiff/services/items.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/login.dart';
import 'package:polydiff/services/user.dart';

class MainPage extends StatefulWidget {
  @override
  MainPageState createState() => MainPageState();
}

class MainPageState extends State<MainPage> {
  ItemService itemService = ItemService();
  late Container avatar;
  late Text username;
  late String classicGameButtonLabel;
  late String limitedTimeGameButtonLabel;
  late String storeButtonLabel;
  late String logoutButtonLabel;

  late List<ButtonData> buttons;
  List<Item> boughtMedals = [];

  @override
  void initState() {
    super.initState();
    refreshUserData();
    refreshButtonsLabel();
    fetchBoughtMedals();
  }


  void fetchBoughtMedals() async {
    var items = await itemService.getBoughtItems(User.username);
    print('$items items');
    setState(() {
      boughtMedals = items.where((e) => e.type == 'Medal').toList();
      print('boughtMedals: $boughtMedals');
    });
  }
  void refreshButtonsLabel() {
    setState(() {
      classicGameButtonLabel = LanguageService().translate(
          frenchString: 'Mode classique', englishString: 'Classic Mode');
      limitedTimeGameButtonLabel = LanguageService().translate(
          frenchString: 'Mode temps limité',
          englishString: 'Limited Time Mode');
      storeButtonLabel = LanguageService()
          .translate(frenchString: 'Boutique', englishString: 'Store');
      logoutButtonLabel = LanguageService()
          .translate(frenchString: 'Déconnexion', englishString: 'Logout');

      buttons = [
        ButtonData(classicGameButtonLabel, () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => SelectoPageWidget(),
            ),
          );
        }),
        ButtonData(limitedTimeGameButtonLabel, () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => LimitedSelecto(),
            ),
          );
        }),
        ButtonData(
          storeButtonLabel,
          () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => ShopPage(),
              ),
            );
          },
        ),
        ButtonData(logoutButtonLabel, () async {
          await LoginService.logout();
          User.username = '';
          Navigator.pushAndRemoveUntil(
            context,
            MaterialPageRoute(
              builder: (context) => HomePage(),
            ),
            (Route<dynamic> route) => false,
          );
        }),
      ];
    });
  }

  void refreshUserData() {
    setState(() {
      avatar = User.getAvatar();
      username = Text(User.username);
    });
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
        canPop:
            false, // Prevents the user from navigating back to the login page
        child: LayoutBuilder(builder: (context, constraints) {
          return Scaffold(
            appBar: AppBar(
              automaticallyImplyLeading:
                  false, // Remove back arrow from display
              title: Text(LanguageService()
                  .translate(frenchString: 'Accueil', englishString: 'Home')),
              actions: <Widget>[
                Row(
                  children: [
                    UserSettingsButton(refreshUserData, refreshButtonsLabel),
                    SizedBox(width: 10),
                    Text(LanguageService().translate(
                            frenchString: 'Bonjour ', englishString: 'Hi ') +
                        User.username),
                    SizedBox(width: 10),
                    User.avatar,
                    // TODO: iteration sur boughtMedals et affiche les en dessous du avatar en petit
                    // affiche moi chanque image dans boughtMedals
                    for (var medal in boughtMedals)
                      Image.asset(
                        medal.path!,
                        height: 20,
                      ),
                  ],
                )
              ],
            ),
            body: Stack(
              children: [
                Row(
                  children: [
                    Expanded(
                      flex: 1,
                      child: Container(),
                    ),
                    Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        for (var button in buttons)
                          Column(
                            children: [
                              SizedBox(
                                width: 200,
                                child: ElevatedButton(
                                  onPressed: button.onPressed,
                                  child: Text(button.label),
                                ),
                              ),
                              if (button != buttons.last) SizedBox(height: 20),
                            ],
                          ),
                      ],
                    ),
                    Image.asset(
                      'assets/images/logo1.png',
                      height: constraints.maxHeight * 0.5,
                    ),
                    Expanded(
                      flex: 1,
                      child: Container(),
                    ),
                  ],
                ),
                Align(
                    alignment: Alignment.bottomRight, child: MessageSideBar()),
              ],
            ),
          );
        }));
  }
}

class ButtonData {
  final String label;
  final VoidCallback onPressed;

  ButtonData(this.label, this.onPressed);
}
