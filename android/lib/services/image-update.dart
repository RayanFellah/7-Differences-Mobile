import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:image/image.dart' as img_lib;
import 'package:polydiff/services/consts.dart';
import 'package:polydiff/services/diference.dart';

class ImageUpdateService {
  Future<Uint8List> updateImage(List<Difference>? diffArray, Uint8List  imgBytes1, Uint8List  imgBytes2) async {
    // Convert ui.Image to img.Image for manipulation
    final img1 = img_lib.decodeImage(imgBytes1)!;
    final img2 = img_lib.decodeImage(imgBytes2)!;

    if (diffArray != null && diffArray.isNotEmpty) {
      final difference = diffArray[0]; // Supposons qu'on ne traite qu'une différence pour simplifier
      for (var point in difference.points) {
        final base = (point ~/ Consts.PIXEL_SIZE);
        final y = (base ~/ Consts.IMAGE_WIDTH);
        final x = base - (Consts.IMAGE_WIDTH * y);
        final color = img1.getPixelSafe(x, y);
        img2.setPixelSafe(x, y, color);
      }
    final updatedImgBytes2 = img_lib.encodePng(img2);
    return Uint8List.fromList(updatedImgBytes2);
    } else {
      return imgBytes2; // Return the unmodified image if no differences
    }
  }

  Future<img_lib.Image> _convertToImgImage(ui.Image uiImage) async {
    // Logic to convert a ui.Image to an img.Image
    final byteData =
        await uiImage.toByteData(format: ui.ImageByteFormat.rawUnmodified);
    final buffer = byteData!.buffer.asUint8List();
    return img_lib.decodeImage(buffer)!;
  }

  Future<ui.Image> _convertToUiImage(img_lib.Image imgImage) async {
    final List<int> encoded = img_lib.encodePng(imgImage);
    final Uint8List encodedUint8List = Uint8List.fromList(encoded);
    final codec = await ui.instantiateImageCodec(encodedUint8List);
    final frame = await codec.getNextFrame();

    return frame.image;
  }
}












// import 'dart:typed_data';
// import 'dart:ui' as ui;

// import 'package:flutter/material.dart';
// import 'package:image/image.dart' as img;
// import 'package:polydiff/services/consts.dart';
// import 'package:polydiff/services/diference.dart';

// class ImageUpdateService {
//   Future<Map<String, dynamic>> updateImage(List<Difference>? diffArray, Canvas canvas1, Canvas canvas2, ui.Image img1, ui.Image img2) async {
//     final ctx1 = canvas1;
//     ctx1.drawImage(img1, Offset.zero, Paint());
//     final ctx2 = canvas2;
//     ctx2.drawImage(img2, Offset.zero, Paint());

//     final paint = Paint();
//     final img1Data = await _imageToImageData(img1);
//     final img2Data = await _imageToImageData(img2);
//     // Your logic here
//     if (diffArray != null && diffArray.isNotEmpty) {
//       final difference = diffArray[0];
//       // final data1 = ctx1.getImageData(Rect.fromLTRB(0, 0, Consts.IMAGE_WIDTH as double, Consts.IMAGE_HEIGHT as double));
//       // var data2 = ctx2.getImageData(Rect.fromLTRB(0, 0, Consts.IMAGE_WIDTH as double, Consts.IMAGE_HEIGHT as double));
//       _updateData(difference, img1Data, img2Data);
//       // if (data1 != null && data2 != null) {
//       //   data2 = _updateData(difference, data1, data2);
//       //   ctx2.putImageData(data2, Offset.zero);
//       // }
//     final updatedImg1 = await _imageDataToUiImage(img1Data);
//     final updatedImg2 = await _imageDataToUiImage(img2Data);
//     canvas1.drawImage(updatedImg1, Offset.zero, paint);
//     canvas2.drawImage(updatedImg2, Offset.zero, paint);
//     }
//     return {'c1': canvas1, 'c2': canvas2};
//   }

//     // Fonction pour convertir ui.Image en img.Image
//   Future<img.Image> _imageToImageData(ui.Image image) async {
//     final byteData = await image.toByteData(format: ui.ImageByteFormat.rawRgba);
//     final buffer = byteData?.buffer.asUint8List();
//     return img.Image.fromBytes(image.width, image.height, buffer as List<int>);
//   }

//   // Fonction pour convertir img.Image en ui.Image
//   Future<ui.Image> _imageDataToUiImage(img.Image imageData) async {
//     final codec = await ui.instantiateImageCodec(Uint8List.fromList(img.encodePng(imageData)));
//     final frame = await codec.getNextFrame();
//     return frame.image;
//   }

//   void _updateData(Difference difference, img.Image img1Data, img.Image img2Data) {
//   for (var point in difference.points) {
//     final base = point ~/ Consts.PIXEL_SIZE; // Utilisez l'opérateur de division entière pour éviter d'avoir besoin d'arrondir
//     final y = base ~/ Consts.IMAGE_WIDTH;
//     final x = base % Consts.IMAGE_WIDTH; // Le reste de la division donne la coordonnée x
//     final index = y * Consts.IMAGE_WIDTH + x;

//     // Dans le package image, vous accédez directement aux pixels avec getPixel et setPixel
//     final pixel = img1Data.getPixel(x, y);
//     img2Data.setPixel(x, y, pixel);
//   }
// }

// }

// // Fictitious class to simulate ImageData, as Flutter does not have a direct equivalent
// class ImageData {
//   List<double> pixels; // List to store the pixel data

//   ImageData(this.pixels); // Constructor to initialize the pixel data

//   // Add any additional methods or properties as needed
// }
