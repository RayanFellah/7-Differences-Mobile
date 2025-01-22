import 'package:flutter/material.dart';
import 'package:polydiff/pages/main-page.dart';

class PopupEndingDialog extends StatelessWidget {
  final String message;

  PopupEndingDialog({required this.message});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text('Message'),
      content: Text(message),
      actions: <Widget>[
        TextButton(
          child: Text('Retour au menu'),
          onPressed: () {
            Navigator.of(context).push(MaterialPageRoute(
              builder: (context) => MainPage(),
            ));
          },
        ),
      ],
    );
  }
}
