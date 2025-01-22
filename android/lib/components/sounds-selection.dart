import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:polydiff/services/items.dart';
import 'package:polydiff/services/language.dart';

import '../services/user.dart';

class SoundsSelection extends StatefulWidget {
  // SoundsSelection();
  @override
  _SoundsSelectionState createState() => _SoundsSelectionState();
}

class _SoundsSelectionState extends State<SoundsSelection> {
  final ItemService itemService = ItemService();
  final AudioPlayer audioPlayer = AudioPlayer();
  List<Item?> boughtSounds = [];
  final int defaultSoundPrice = 50;


  @override
  void initState() {
    super.initState();
    fetchBoughtSounds();
  }

  void fetchBoughtSounds() async {
    var items = await itemService.getBoughtItems(User.username);
    setState(() {
      boughtSounds = items.where((e) => e.type == 'Sound').toList();
    });
  }

  // bool isUsed(String soundName) {
  //   return boughtSounds.any((item) => item?.name == soundName);
  // }

  void playSound(String audioPath) async {
    await audioPlayer.play(AssetSource(audioPath));
  }

  void useSpecialSound(Item sound) {
    print('User.specialErrorSoundUsed: ${User.specialErrorSoundUsed}');
    if (sound.name == 'Son de succès') {
      setState(() {
        User.specialSuccessSoundUsed = true;
      });
    }
    if (sound.name == 'Son d\'échec') {
      setState(() {
        User.specialErrorSoundUsed = true;
      });
    }
  }

  void unUseSpecialSound(Item sound) {
    if (sound.name == 'Son de succès') {
      setState(() {
        User.specialSuccessSoundUsed = false;
      });
    }
    if (sound.name == 'Son d\'échec') {
      setState(() {
        User.specialErrorSoundUsed = false;
      });
    }
  }

  bool isUsed(String soundName) {
    if (soundName == 'Son de succès') {
      return User.specialSuccessSoundUsed;
    }
    if (soundName == 'Son d\'échec') {
      return User.specialErrorSoundUsed;
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
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
      width: // 80% of screen
          MediaQuery.of(context).size.width * 0.8,
      height: 180,
      padding: EdgeInsets.all(10),
      margin: EdgeInsets.all(10),
      child: Row(
        children: [
          Expanded(
            flex: 1,
            child: Column(
              children: [
                SizedBox(height: 20), // Add distance
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
                SizedBox(height: 20), // Add distance

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
              itemCount: boughtSounds.length,
              itemBuilder: (BuildContext context, int index) {
                Item sound = boughtSounds[index] as Item;
                bool isUsed = this.isUsed(sound.name);
                print('$isUsed ---> isUsed');
                return Flexible(
                  flex: 1,
                  child: Container(
                    width: 200, // Ajustez selon la taille de vos widgets
                    margin: EdgeInsets.all(10),
                    padding: EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Color(0xFF1a2b3c),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Text(sound.name),
                        SizedBox(width: 8),
                            ElevatedButton(
                              onPressed: () =>
                                  playSound(sound.path!), // Jouer le son
                              child: Icon(Icons.play_arrow),
                            ),
                          ],
                        ),
                        SizedBox(height: 8),
                        isUsed
                            ? ElevatedButton(
                                onPressed: () => unUseSpecialSound(sound),
                                child: Text(
                                  LanguageService().translate(
                                    frenchString: 'Utiliser le son par défaut',
                                    englishString: 'Use the default sound',
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              )
                            : ElevatedButton(
                                onPressed: () => useSpecialSound(sound),
                                child: Text(
                                  LanguageService().translate(
                                    frenchString: 'Utiliser le son spécial',
                                    englishString: 'Use the special sound',
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                      ],
                    ),
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
