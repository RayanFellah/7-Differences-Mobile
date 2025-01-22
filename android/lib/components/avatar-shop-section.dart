import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:polydiff/services/image-from-server.dart';
import 'package:polydiff/services/items.dart';
import 'package:polydiff/services/language.dart';

import '../services/user.dart';

class AvatarsSection extends StatefulWidget {
  final Function(int) updateBalance;
  final List<Item> boughtItems;
  AvatarsSection({required this.updateBalance, required this.boughtItems});
  @override
  _AvatarsSectionState createState() => _AvatarsSectionState();
}

class _AvatarsSectionState extends State<AvatarsSection> {
  final int defaultAvatarPrice = 100; // Exemple de prix

  bool isOwned(String avatarName, List<Item> boughtItems) {
    return boughtItems.any((item) => item.name == avatarName);
  }

  Future<void> buyAvatar(String avatarName) async {
    final body = json.encode({
      'item': {
        'path': AvatarImageFromServer.getAvatarUrl(avatarName),
        'name': avatarName,
        'type': 'Avatar',
        'price': defaultAvatarPrice,
      }
    });

    final response = await http.post(
      Uri.parse(
          '${dotenv.env['SERVER_URL_AND_PORT']}api/fs/players/${User.username}/shop'),
      headers: {'Content-Type': 'application/json'},
      body: body,
    );

    if (response.statusCode == 200) {
      widget.updateBalance(defaultAvatarPrice);
      setState(() {
        widget.boughtItems.add(Item.fromJson(json.decode(body)['item']));
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Achat réussi!')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur d\'achat.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    List<String> avatarsNames = ItemService.allAppAvatars;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF1a2b3c),
            Color(0xFF2d3e4f),
          ],
        ),
      ),
      width: MediaQuery.of(context).size.width * 0.8,
      height: 250,
      padding: EdgeInsets.all(10),
      margin: EdgeInsets.all(10),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: Column(
              children: [
                SizedBox(height: 20),
                Text(
                  'Avatars',
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.yellow),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 20),
                Text(
                  LanguageService().translate(
                      frenchString:
                          'Achetez un avatar spécial pour personnaliser votre profil !',
                      englishString:
                          'Buy a special avatar to customize your profile!'),
                  style: TextStyle(
                      color: Colors.grey, fontStyle: FontStyle.italic),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          Expanded(
            flex: 2,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: avatarsNames.length,
              itemBuilder: (context, index) {
                String avatar = avatarsNames[index];
                bool owned = isOwned(avatar, widget.boughtItems);

                return Container(
                    width: 150,
                    margin: EdgeInsets.all(10),
                    padding: EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Color(0xFF1a2b3c),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      children: <Widget>[
                        Image.network(AvatarImageFromServer.getAvatarUrl(avatar),
                            width: 100, height: 100),
                        Text(avatar, style: TextStyle(color: Colors.white)),
                        SizedBox(height: 4),
                        owned
                            ? Text(
                                LanguageService().translate(
                                    frenchString: 'Acheté',
                                    englishString: 'Owned'),
                                style: TextStyle(color: Colors.green))
                            : ElevatedButton(
                                onPressed: () => buyAvatar(avatar),
                                child: Text('$defaultAvatarPrice dinars'),
                              ),
                      ],
                    ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
