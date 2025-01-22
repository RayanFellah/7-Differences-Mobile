import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:image/image.dart' as img;
import 'package:polydiff/services/communication.dart';
import 'package:polydiff/services/diference.dart';
import 'package:polydiff/services/game-card-template.dart';
import 'package:polydiff/services/game-info.dart';
import 'package:polydiff/services/socket.dart';

class CardQueueService {
  static final CardQueueService _instance = CardQueueService._internal();

  factory CardQueueService() => _instance;

  final CommunicationService communicationService = CommunicationService();
  final GameInfoService gameInfo = GameInfoService();

    late int current;

  late StreamController<Uint8List> leftImage;
  late StreamController<Uint8List> rightImage;
  late StreamController<Uint8List> leftImageTemp;
  late StreamController<Uint8List> rightImageTemp;

  late StreamController<List<Difference>> differences;
  late StreamController<List<Difference>> differencesRemoved;

  late StreamController<bool> gameEnded;

  late List<int> cardOrder = [];
  late int nGameCards;
  late List<GameCardTemplate> gameCards;
  List<Difference> differenceRemovedList = [];
  
  List<String> playerNames = [];
  
  var playerNamesController = StreamController<List<String>>.broadcast();

   CardQueueService._internal() {
        current = 0;
    leftImage = StreamController<Uint8List>.broadcast();
    rightImage = StreamController<Uint8List>.broadcast();
    leftImageTemp = StreamController<Uint8List>.broadcast();
    rightImageTemp = StreamController<Uint8List>.broadcast();
    differences = StreamController<List<Difference>>.broadcast();
    differencesRemoved = StreamController<List<Difference>>.broadcast();
    cardOrder = gameInfo.cardOrder;
    nGameCards = gameInfo.nGameCards;
    gameCards = gameInfo.gameCards;
    gameEnded = StreamController<bool>.broadcast();
    SocketService.socket.on('nextCardLimite', (data) {
      print('nextCardLimite $data');
      List<dynamic> dynamicList = data['card']['differences'];
      List<Difference> differenceList =
          dynamicList.map((item) => Difference.fromJson(item)).toList();
      differences.add(differenceList);
      // differences.add(data['card']['differences']);
      List<dynamic> dynamicRemovedDiff = data['remove'];
      differenceRemovedList =
          dynamicRemovedDiff.map((item) => Difference.fromJson(item)).toList();
      differencesRemoved.add(differenceRemovedList);
      setUpImage(data); // voir dowloadImage de gameCard pour images
    });

    SocketService.socket.on('imageUpdated', (data) async {
      // print('imageUpdated $data');

      // print('imageUpdate');
      String? leftImageBase64 = data['Img1'];
      String? rightImageBase64 = data['Img2'];

      // Remove the Data URL scheme from the base64 strings
      leftImageBase64 =
          leftImageBase64?.replaceFirst('data:image/bmp;base64,', '');
      rightImageBase64 =
          rightImageBase64?.replaceFirst('data:image/bmp;base64,', '');
      // Convert the BMP images to PNG
      // leftImageBase64 = convertBmpToPng(leftImageBase64!);
      // rightImageBase64 = convertBmpToPng(rightImageBase64!);

      // leftImageBase64 =
      //     leftImageBase64?.replaceFirst('data:image/png;base64,', '');
      // rightImageBase64 =
      //     rightImageBase64?.replaceFirst('data:image/png;base64,', '');

      // Check if the conversion was successful
      if (leftImageBase64 == null || rightImageBase64 == null) {
        print('Failed to convert the images to PNG');
        return;
      }

      Uint8List leftImageData = base64Decode(leftImageBase64);
      Uint8List rightImageData = base64Decode(rightImageBase64);
      leftImage.add(leftImageData);
      rightImage.add(rightImageData);
    });


    SocketService.socket.on('Players', (res) {
      print('PlayerNames: $res');
      if (res != null) {
        List<String> stringList =
            List<String>.from(res.map((item) => item.toString()));
        playerNames = stringList;
        playerNamesController.add(stringList);
        print('Updated player names: $playerNames');
      }
    });
   }

  // CardQueueService(
  //     {required this.communicationService, required this.gameInfo}) {


        
  //   current = 0;
  //   leftImage = StreamController<Uint8List>.broadcast();
  //   rightImage = StreamController<Uint8List>.broadcast();
  //   leftImageTemp = StreamController<Uint8List>.broadcast();
  //   rightImageTemp = StreamController<Uint8List>.broadcast();
  //   differences = StreamController<List<Difference>>.broadcast();
  //   differencesRemoved = StreamController<List<Difference>>.broadcast();
  //   cardOrder = gameInfo.cardOrder;
  //   nGameCards = gameInfo.nGameCards;
  //   gameCards = gameInfo.gameCards;
  //   gameEnded = StreamController<bool>.broadcast();
  //   SocketService.socket.on('nextCardLimite', (data) {
  //     print('nextCardLimite $data');
  //     List<dynamic> dynamicList = data['card']['differences'];
  //     List<Difference> differenceList =
  //         dynamicList.map((item) => Difference.fromJson(item)).toList();
  //     differences.add(differenceList);
  //     // differences.add(data['card']['differences']);
  //     List<dynamic> dynamicRemovedDiff = data['remove'];
  //     differenceRemovedList =
  //         dynamicRemovedDiff.map((item) => Difference.fromJson(item)).toList();
  //     differencesRemoved.add(differenceRemovedList);
  //     setUpImage(data); // voir dowloadImage de gameCard pour images
  //   });

  //   SocketService.socket.on('imageUpdated', (data) async {
  //     // print('imageUpdated $data');

  //     // print('imageUpdate');
  //     String? leftImageBase64 = data['Img1'];
  //     String? rightImageBase64 = data['Img2'];

  //     // Remove the Data URL scheme from the base64 strings
  //     leftImageBase64 =
  //         leftImageBase64?.replaceFirst('data:image/bmp;base64,', '');
  //     rightImageBase64 =
  //         rightImageBase64?.replaceFirst('data:image/bmp;base64,', '');
  //     // Convert the BMP images to PNG
  //     // leftImageBase64 = convertBmpToPng(leftImageBase64!);
  //     // rightImageBase64 = convertBmpToPng(rightImageBase64!);

  //     // leftImageBase64 =
  //     //     leftImageBase64?.replaceFirst('data:image/png;base64,', '');
  //     // rightImageBase64 =
  //     //     rightImageBase64?.replaceFirst('data:image/png;base64,', '');

  //     // Check if the conversion was successful
  //     if (leftImageBase64 == null || rightImageBase64 == null) {
  //       print('Failed to convert the images to PNG');
  //       return;
  //     }

  //     Uint8List leftImageData = base64Decode(leftImageBase64);
  //     Uint8List rightImageData = base64Decode(rightImageBase64);
  //     leftImage.add(leftImageData);
  //     rightImage.add(rightImageData);
  //   });


  //   SocketService.socket.on('Players', (res) {
  //     print('PlayerNames: $res');
  //     if (res != null) {
  //       List<String> stringList =
  //           List<String>.from(res.map((item) => item.toString()));
  //       playerNames = stringList;
  //       playerNamesController.add(stringList);
  //       print('Updated player names: $playerNames');
  //     }
  //   });


  // }

  String? convertBmpToPng(String base64Bmp) {
    // Decode the Base64 image to bytes
    final bmpBytes = base64Decode(base64Bmp);

    // Decode the BMP image
    final bmpImage = img.decodeImage(bmpBytes);

    // If the image could not be decoded, return null
    if (bmpImage == null) {
      print('Failed to decode the BMP image');
      return null;
    }

    // Encode the image to PNG
    final pngBytes = img.encodePng(bmpImage);

    // Encode the new image to Base64
    final base64Png = base64Encode(pngBytes);

    return 'data:image/png;base64,$base64Png';
  }

  void setUpImage(dynamic data) async {
    print('setupImage');
    var img1ID = data['card']['img1ID'];
    var img2ID = data['card']['img2ID'];
    pullLeftImage(img1ID);
    pullRightImage(img2ID);
    print('$leftImageTemp leftImageTemp');
    // String leftImageBase64 =
    //     'data:image/bmp;base64,${base64Encode(await leftImageTemp.stream.first)}';
    // String rightImageBase64 =
    //     'data:image/bmp;base64,${base64Encode(await rightImageTemp.stream.first)}';

    List<int> leftImageData =
        (await leftImageTemp.stream.toList()).expand((x) => x).toList();
    String leftImageBase64 =
        'data:image/bmp;base64,${base64Encode(leftImageData)}';

    List<int> rightImageData =
        (await rightImageTemp.stream.toList()).expand((x) => x).toList();
    String rightImageBase64 =
        'data:image/bmp;base64,${base64Encode(rightImageData)}';
    differencesRemoved.stream.first.then((listOfDifferences) {
      var encodableListOfDifferences =
          listOfDifferences.map((difference) => difference.toJson()).toList();
      SocketService.socket.emit('removeDifferences', {
        'Img1': leftImageBase64,
        'Img2': rightImageBase64,
        'remove': encodableListOfDifferences
      });
    });
  }

  Future<void> pullLeftImage(String img1ID) async {
    print('pullLeftImage');
    communicationService.downloadImage(img1ID).then((value) {
      var img1Bytes = base64Decode(value.body);
      leftImageTemp.add(img1Bytes);
    });
  }

  //might change to imgTemp
  void pullRightImage(String img2ID) async {
    print('pullRightImage');
    communicationService.downloadImage(img2ID).then((value) {
      var img2Bytes = base64Decode(value.body);
      rightImageTemp.add(img2Bytes);
    });
  }

  void getNext() async {
    print('getNext');
    SocketService.socket.emit('getNextCardLimite', {});
    return;
  }



  void setImages(dynamic data) {
    print('called');
    String? leftImageBase64 = data['Img1'];
    String? rightImageBase64 = data['Img2'];

    leftImageBase64 =
        leftImageBase64?.replaceFirst('data:image/bmp;base64,', '');
    rightImageBase64 =
        rightImageBase64?.replaceFirst('data:image/bmp;base64,', '');
    if (leftImageBase64 == null || rightImageBase64 == null) {
      print('Failed to convert the images to PNG');
      return;
    }

    Uint8List leftImageData = base64Decode(leftImageBase64);
    Uint8List rightImageData = base64Decode(rightImageBase64);
    leftImage.add(leftImageData);
    rightImage.add(rightImageData);
  }

  stopListening() {
    leftImage.close();
    rightImage.close();
    leftImageTemp.close();
    rightImageTemp.close();
    differences.close();
    differencesRemoved.close();
    gameEnded.close();
    SocketService.socket.off('nextCardLimite');
    SocketService.socket.off('imageUpdated');
    SocketService.socket.off('Players');
    // SocketService.socket.off('removeDifferences');
    // SocketService.socket.off('gameEnded');
  }
} 
