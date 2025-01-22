import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:polydiff/components/user-avatar.dart';

class AvatarImageFromServer {
  static String getAvatarUrl(String avatar) {
    return '${dotenv.env['SERVER_URL_AND_PORT']}avatars/$avatar';
  }

  static Image getAvatarImage(String avatar) {
    return Image.network(getAvatarUrl(avatar));
  }

  static Container customAvatar(String avatar) {
    Key key = UniqueKey();
    Image image = getAvatarImage('$avatar?version=$key');
    return UserAvatar.customAvatar(image);
  }

  static Container regularAvatar(String avatarFileName) {
    // ignore: sized_box_for_whitespace
    return Container(
        height: 50,
        width: 50,
        child: Image(image: getAvatarImage(avatarFileName).image));
  }

  static Container getAvatar(String avatarFileName) {
    if (avatarFileName.startsWith('pictures/')) {
      return customAvatar(avatarFileName);
    } else {
      return regularAvatar(avatarFileName);
    }
  }
}

class AvatarProvider with ChangeNotifier {
  Map<String, Container> avatarCache = {};

  Container getAvatar(String avatarString) {
    if (!avatarCache.containsKey(avatarString)) {
      avatarCache[avatarString] = AvatarImageFromServer.getAvatar(avatarString);
    }
    return avatarCache[avatarString]!;
  }
}
