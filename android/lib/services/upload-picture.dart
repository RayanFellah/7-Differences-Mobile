import 'dart:io';

import 'package:http/http.dart';
import 'package:polydiff/services/http-request-tool.dart';
import 'package:polydiff/services/user.dart';

class UploadPictureService {
  static Future<void> uploadPicture(String filePath) async {
    var uri = Uri.parse(
        '${HttpRequestTool.prefix}api/fs/players/${User.username}/avatarUpload');

    var request = MultipartRequest('POST', uri);
    var file = File(filePath);

    request.files.add(MultipartFile(
      'file',
      file.readAsBytes().asStream(),
      file.lengthSync(),
      filename: '${User.username}.jpg',
    ));
    var response = await request.send();
    if (response.statusCode == 200) {
      print('Uploaded successfully');
    } else {
      print('Upload failed');
    }
  }
}
