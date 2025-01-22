import 'package:flutter/material.dart';

// Standard circle user avatar
class UserAvatar {
  static Container customAvatar(Image image) {
    return Container(
      height: 50,
      width: 50,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(
          color: Colors.white,
          width: 2.0,
        ),
        image: DecorationImage(
          image: image.image,
          fit: BoxFit.cover,
        ),
      ),
    );
  }
}
