import 'dart:io';

import 'package:flutter/material.dart';
import 'package:polydiff/pages/picture.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/upload-picture.dart';

class DisplayPictureScreen extends StatelessWidget {
  final String imagePath;
  final Function refreshCustomAvatar;

  const DisplayPictureScreen(this.imagePath, this.refreshCustomAvatar);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: Text(
            LanguageService().translate(
                frenchString: 'Confirmation de l\'avatar',
                englishString: 'Avatar confirmation'
            )
          ),
          actions: <Widget>[
            ElevatedButton(
              child: Text(
                LanguageService().translate(
                    frenchString: 'Téléverser',
                    englishString: 'Upload'
                )
              ),
              onPressed: () {
                UploadPictureService.uploadPicture(imagePath);
                refreshCustomAvatar(imagePath);
                Navigator.pop(context);
                Navigator.pop(context);
              },
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                        builder: (context) =>
                            (TakePictureScreen(refreshCustomAvatar))));
              },
              child: Text(
                LanguageService().translate(
                    frenchString: 'Reprendre la photo',
                    englishString: 'Retake the picture'
                )  
              ),
            ),
          ],
        ),
        body: Container(
            alignment: Alignment.center,
            child: Container(
              height: 100,
              width: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: Colors.white,
                  width: 2.0,
                ),
                image: DecorationImage(
                  image: Image.file(File(imagePath)).image,
                  fit: BoxFit.cover,
                ),
              ),
            )));
  }
}
