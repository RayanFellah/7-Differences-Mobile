import 'dart:async';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:polydiff/pages/picture-confirmation-page.dart';
import 'package:polydiff/services/camera.dart';
import 'package:polydiff/services/language.dart';

class TakePictureScreen extends StatefulWidget {
  final Function refreshCustomAvatar;
  TakePictureScreen(this.refreshCustomAvatar);

  @override
  TakePictureScreenState createState() => TakePictureScreenState();
}

class TakePictureScreenState extends State<TakePictureScreen> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;

  @override
  void initState() {
    super.initState();
    _controller = CameraController(
      Camera.camera,
      ResolutionPreset.medium,
    );
    _initializeControllerFuture = _controller.initialize();
  }
  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: Text(
          LanguageService().translate(
              frenchString: 'Prenez une photo pour votre avatar',
              englishString: 'Take a picture for your avatar'
          )),
        ),
        body: FutureBuilder<void>(
          future: _initializeControllerFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done) {
              return CameraPreview(_controller);
            } else {
              return const Center(child: CircularProgressIndicator());
            }
          },
        ),
        floatingActionButton:
            Row(mainAxisAlignment: MainAxisAlignment.end, children: <Widget>[
          FloatingActionButton(
            onPressed: () async {
              try {
                await _initializeControllerFuture;
                var rawImage = await _controller.takePicture();

                var filePath = '${rawImage.path}_compressed.jpg';
                var image = await FlutterImageCompress.compressAndGetFile(
                  rawImage.path,
                  filePath,
                  minWidth: 400,
                  minHeight: 400,
                  quality: 40,
                  format: CompressFormat.jpeg,
                  inSampleSize: 4,
                );
                if (image == null) return;
                if (!mounted) return;
                print('Compressed: ${image.lengthSync() / (1024)} MB ');

                await Navigator.of(context).pushReplacement(
                  MaterialPageRoute(
                    builder: (context) => DisplayPictureScreen(
                      filePath,
                      widget.refreshCustomAvatar,
                    ),
                  ),
                );
              } catch (e) {
                print(e);
              }
            },
            heroTag: 'Take Picture',
            child: const Icon(Icons.camera_alt),
          ),
          FloatingActionButton(
              heroTag: 'Switch Camera',
              onPressed: switchCamera,
              child: const Icon(Icons.camera_rear))
        ]));
  }

  switchCamera() {
    print('Switch Camera');
    if (Camera.cameras.length > 1) {
      if (_controller.description == Camera.cameras[0]) {
        _controller = CameraController(
          Camera.cameras[1],
          ResolutionPreset.medium,
        );
      } else {
        _controller = CameraController(
          Camera.cameras[0],
          ResolutionPreset.medium,
        );
      }
      _initializeControllerFuture = _controller.initialize();
      setState(() {});
    }
  }
}
