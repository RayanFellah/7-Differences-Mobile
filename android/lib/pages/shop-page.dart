// shop_page.dart
import 'package:flutter/material.dart';
import 'package:polydiff/components/avatar-shop-section.dart';
import 'package:polydiff/components/medals-shop-section.dart';
import 'package:polydiff/components/message-sidebar.dart';
import 'package:polydiff/components/shop-wheel.dart';
import 'package:polydiff/components/sounds-section.dart';
import 'package:polydiff/services/items.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/user.dart';

class ShopPage extends StatefulWidget {
  @override
  _ShopPageState createState() => _ShopPageState();
}

class _ShopPageState extends State<ShopPage> {
  final ItemService itemService = ItemService();
  final int wheelPrice = 5;
  // late Future<List<Item>> boughtItemsFuture;
  List<Item> boughtItems = [];

  // @override
  // void initState() {
  //   super.initState();
  //   fetchBoughtItems();
  // }

  Future<List<Item>> fetchBoughtItems() async {
    // return boughtItems;
    return await itemService.getBoughtItems(User.username);
  }

  bool isOwned() {
    return boughtItems.any((item) => item.name == 'Multiplicateur x2');
  }

  void updateUserBalance(int cost) {
    setState(() {
      User.dinarsAmount -= cost;
    });
  }

  void openWheelDialog(BuildContext context) {
    if (User.dinarsAmount < wheelPrice) {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text(
              LanguageService().translate(
                frenchString: 'Solde insuffisant',
                englishString: 'Insufficient balance',
              ),
            ),
            content: Text(
              LanguageService().translate(
                frenchString:
                    'Vous n\'avez pas assez de dinars pour ouvrir la roue. Jouez à des jeux pour gagner plus de dinars.',
                englishString:
                    'You do not have enough dinars to open the wheel. Play games to earn more dinars.',
              ),
            ),
            actions: <Widget>[
              TextButton(
                child: Text(
                  LanguageService().translate(
                    frenchString: 'Fermer',
                    englishString: 'Close',
                  ),
                ),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        },
      );
      return;
    } else if (isOwned()) {
      print('already owned');
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text(
              LanguageService().translate(
                frenchString: 'Déjà possédé',
                englishString: 'Already owned',
              ),
            ),
            content: Text(
              LanguageService().translate(
                frenchString:
                    'Vous avez déjà acheté un multiplicateur de points. Vous ne pouvez pas en acheter un autre.',
                englishString:
                    'You have already purchased a points multiplier. You cannot purchase another one.',
              ),
            ),
            actions: <Widget>[
              TextButton(
                child: Text(
                  LanguageService().translate(
                    frenchString: 'Fermer',
                    englishString: 'Close',
                  ),
                ),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        },
      );
      return;
    }
    setState(() {
      User.dinarsAmount -= wheelPrice;
    });
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          content: Container(
            // Définissez les dimensions si nécessaire
            width: double.maxFinite,
            child:
                WheelPage(), // Assurez-vous que c'est le nom de votre widget de roue
          ),
          actions: <Widget>[
            TextButton(
              child: Text(
                LanguageService().translate(
                  frenchString: 'Fermer',
                  englishString: 'Close',
                ),
              ),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Boutique de Jeu'),
        actions: [
          ElevatedButton(
            onPressed: () => openWheelDialog(context),
            child: Text(
              LanguageService().translate(
                frenchString:
                    'Faites tourner la roue de fortune contre 5 dinars',
                englishString: 'Swing the fortune wheel for 5 dinars',
              ),
            ),
          ),
          Text(
            LanguageService().translate(
              frenchString: 'Solde actuel: ',
              englishString: 'Current balance: ',
            ),
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
            ),
          ),
          Text(
            '${User.dinarsAmount} dinars',
            style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: Colors.yellow[700]),
          ),
        ],
      ),
      body: FutureBuilder<List<Item>>(
        future: fetchBoughtItems(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.connectionState == ConnectionState.done) {
            if (snapshot.hasError) {
              return Container(color: Colors.red);
            } else if (snapshot.hasData) {
              boughtItems = snapshot.data!;
              return Stack(
                children: [
                     SingleChildScrollView(
                      child: Center(
                        child: Column(
                          children: [
                            MedalsSection(
                            updateBalance: updateUserBalance,
                                              boughtItems: boughtItems),
                            AvatarsSection(updateBalance: updateUserBalance, boughtItems: boughtItems),
                            SoundsSection(updateBalance: updateUserBalance, boughtItems: boughtItems),
                          ],
                        ),
                      ),
                  ),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: MessageSideBar(),
                  ),
                ],
              );
            }
          }
          return Container(color: Colors.blue);
        },
      ),
    );
  }
}
