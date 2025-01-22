import 'package:flutter/material.dart';
import 'package:polydiff/pages/friends-page.dart';
import 'package:polydiff/pages/user-portal-page.dart';
import 'package:polydiff/services/language.dart';

class UserSettingsButton extends StatelessWidget {
  final Function refreshUserData;
  final Function refreshButtonsLabel;

  const UserSettingsButton(this.refreshUserData, this.refreshButtonsLabel);

  @override
  Widget build(BuildContext context) {
    return
        Row(
      children: [
        ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => FriendsPage()),
            );
          },
          child: Text(LanguageService()
              .translate(frenchString: 'Amis', englishString: 'Friends')),
        ),
        SizedBox(width: 10),
        ElevatedButton(
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) =>
                      UserSettingsPage(refreshUserData, refreshButtonsLabel)),
            );
          },
          child: Text(LanguageService()
              .translate(frenchString: 'Réglages', englishString: 'Settings')),
        ),
      ],
    );
  }
}
