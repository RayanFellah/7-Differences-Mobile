import 'dart:convert';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:polydiff/services/items.dart';
import 'package:polydiff/services/language.dart';

import '../services/user.dart';

class SoundsSection extends StatefulWidget {
  final Function(int) updateBalance;
  final List<Item> boughtItems;
  SoundsSection({required this.updateBalance, required this.boughtItems});
  @override
  _SoundsSectionState createState() => _SoundsSectionState();
}

class _SoundsSectionState extends State<SoundsSection> {
  final AudioPlayer audioPlayer = AudioPlayer();
  final int defaultSoundPrice = 50; // Exemple de prix

  bool isOwned(String soundName) {
    return widget.boughtItems.any((item) => item.name == soundName);
  }

  void playSound(String audioPath) async {
    await audioPlayer.play(AssetSource(audioPath));
  }

  Future<void> buySound(Item sound) async {
    final body = json.encode({
      'item': {
        'path': sound.path,
        'name': sound.name,
        'type': 'Sound',
        'price': defaultSoundPrice,
      }
    });

    final response = await http.post(
      Uri.parse(
          '${dotenv.env['SERVER_URL_AND_PORT']}api/fs/players/${User.username}/shop'),
      headers: {'Content-Type': 'application/json'},
      body: body,
    );

    if (response.statusCode == 200) {
      widget.updateBalance(sound.price);
      setState(() {
        widget.boughtItems.add(Item.fromJson(json.decode(body)['item']));
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(LanguageService().translate(
            englishString: 'Owned',
            frenchString: 'Acheté',
          )),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            LanguageService().translate(
                englishString: 'Purchase error',
                frenchString: 'Erreur d\'achat.'),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    List<Item> sounds = ItemService.getSounds();

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
      height: 220,
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
                  LanguageService().translate(
                    englishString: 'Sounds',
                    frenchString: 'Sons',
                  ),
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.yellow),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 20),
                Text(
                  LanguageService().translate(
                    englishString:
                        'Improve your gaming experience with these exclusive sounds!',
                    frenchString:
                        'Améliorez votre expérience de jeu avec ces sons exclusifs !',
                  ),
                  style: TextStyle(
                      color: Colors.grey, fontStyle: FontStyle.italic),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          Expanded(
            flex: 1,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: sounds.length,
              itemBuilder: (BuildContext context, int index) {
                Item sound = sounds[index];
                bool owned = isOwned(sound.name);
                return Container(
                  width: 150, // Ajustez selon la taille de vos widgets
                  margin: EdgeInsets.all(10),
                  padding: EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Color(0xFF1a2b3c),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    children: <Widget>[
                      Text(sound.name),
                      ElevatedButton(
                        onPressed: () => playSound(sound.path!), // Jouer le son
                        child: Icon(Icons.play_arrow),
                      ),
                      SizedBox(height: 8), // Espace entre l'image et le bouton
                      owned
                          ? Text(
                              LanguageService().translate(
                                  frenchString: 'Acheté',
                                  englishString: 'Owned'),
                              style: TextStyle(color: Colors.green))
                          : ElevatedButton(
                              onPressed: () => buySound(sound),
                              child: Text('$defaultSoundPrice dinars'),
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
