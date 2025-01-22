import 'package:flutter/material.dart';

class PopupQuitComponent extends StatelessWidget {
  final bool gameEnded;
  final String buttonTitle;
  final String message;
  final bool isSolo;
  final Function(bool) wantToQuitChange;

  PopupQuitComponent({
    required this.gameEnded,
    required this.buttonTitle,
    required this.message,
    required this.isSolo,
    required this.wantToQuitChange,
  });

  void closePopup(BuildContext context, bool choice) {
    wantToQuitChange(choice);
    if (choice) {
      Navigator.pushNamed(context, '/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        children: [
          Text(message),
          ElevatedButton(
            onPressed: () => closePopup(context, true),
            child: Text(buttonTitle),
          ),
          if (!gameEnded)
            ElevatedButton(
              onPressed: () => closePopup(context, false),
              child: Text('Non'),
            ),
          if (gameEnded &&
              (ModalRoute.of(context)?.settings.name == '/game' ||
                  ModalRoute.of(context)?.settings.name == '/game1v1'))
            ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/replay'),
              child: Text('Reprise Vidéo'),
            ),
        ],
      ),
    );
  }
}
