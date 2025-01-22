import 'dart:typed_data';

import 'package:polydiff/services/diference.dart';
class ImageTransferService {
  String link1 = '';
  String link2 = '';
  late Uint8List? img1;
  late Uint8List? img2;
  List<Difference> diff = <Difference>[];
}

// class Difference {
//   late List<int> points;
// }
