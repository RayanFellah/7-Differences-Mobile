import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:polydiff/pages/picture.dart';
import 'package:polydiff/services/http-request-tool.dart';
import 'package:polydiff/services/image-from-server.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/user.dart';

class AvatarModification extends StatefulWidget {
  final Function refreshUserData;
  AvatarModification(this.refreshUserData);

  @override
  AvatarModificationState createState() => AvatarModificationState();
}

class AvatarModificationState extends State<AvatarModification> {
  List<String> items = ['avatar1.png', 'avatar2.png', 'avatar3.png'];
  int selectedValue = -1;
  File? customAvatarFile;

  @override
  void initState() {
    getBoughtAvatars();
    super.initState();
  }

  refreshCustomAvatar(String filePath) {
    widget.refreshUserData();
    if (mounted) {
      setState(() {});
    }
  }

  void getBoughtAvatars() async {
    try {
      var res = await HttpRequestTool.basicGet(
          'api/fs/players/${User.id}/hasCustomAvatar');

      if (res.statusCode == 200) {
        print('User Has custom avatar: ${res.body}');
        if (res.body == 'true') {
          items.insert(0, 'pictures/${User.username}.jpg');
        }
      }
      res = await HttpRequestTool.basicGet(
          'api/fs/players/${User.username}/bought-avatars');
      if (res.statusCode == 200) {
        Map<String, dynamic> data = jsonDecode(res.body);
        List<dynamic> boughtAvatars = data['boughtAvatars'];
        for (var avatar in boughtAvatars) {
          items.add(avatar['name']);
        }
        print(items);
      }
    } catch (e) {
      print(e);
    }
    if (mounted) {
      setState(() {});
    }
  }

  void handleRadioValueChange(int? value) {
    if (mounted) {
      setState(() {
        if (value != null) {
          selectedValue = value;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Expanded(
            child: SizedBox(
          height: 120,
          child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: items.length,
              itemBuilder: (context, index) {
                Container image;
                image = AvatarImageFromServer.getAvatar(items[index]);
                return GestureDetector(
                  onTap: () {
                    handleRadioValueChange(index);
                  },
                  child: Container(
                    width: 100,
                    decoration: BoxDecoration(
                      color: index == selectedValue
                          ? const Color.fromARGB(135, 255, 235, 59)
                          : Colors.transparent,
                      border: Border.all(
                        color: index == selectedValue
                            ? Color.fromARGB(255, 19, 77, 250)
                            : Colors.transparent,
                        width: 2.0,
                      ),
                    ),
                    child: image,
                  ),
                );
              }),
        )),
        ElevatedButton(
          child: Text(LanguageService()
              .translate(frenchString: 'Confirmer', englishString: 'Confirm')),
          onPressed: (selectedValue == -1 ||
                  items[selectedValue] == User.avatarFileName)
              ? null
              : () async {
                  String avatarFileName = items[selectedValue];
                  User.setAvatar(avatarFileName);
                  print(User.avatarFileName);

                  try {
                    var res = await HttpRequestTool.basicPut(
                      'api/fs/players/${User.username}/avatar',
                      {'avatar': avatarFileName},
                    );
                    User.avatarFileName = items[selectedValue];
                    selectedValue = -1;
                    if (mounted) {
                      setState(() {});
                    }
                    widget.refreshUserData();
                  } catch (e) {
                    print(e);
                  }
                },
        ),
        ElevatedButton(
          child: Text(LanguageService().translate(
              frenchString: 'Prendre une photo',
              englishString: 'Take a picture')),
          onPressed: () {
            Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) =>
                        (TakePictureScreen(refreshCustomAvatar))));
          },
        ),
      ],
    );
  }
}
