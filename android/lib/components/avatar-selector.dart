import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AvatarSelector extends StatefulWidget {
// class AvatarSelector extends StatelessWidget {
  static const defaultAvatarsQuantity = 3;
  static final List<String> appAvatars = List<String>.generate(
      defaultAvatarsQuantity, (i) => 'avatar${i + 1}.png');

  final Function(String) onAvatarSelected;

  AvatarSelector({required this.onAvatarSelected});

  @override
  _AvatarSelectorState createState() => _AvatarSelectorState();
}

class _AvatarSelectorState extends State<AvatarSelector> {
  String _selectedAvatar = AvatarSelector.appAvatars[0];

  @override
  Widget build(BuildContext context) {
    widget.onAvatarSelected(_selectedAvatar);
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: AvatarSelector.appAvatars.map((avatar) {
          bool isSelected = avatar == _selectedAvatar;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedAvatar = avatar;
              });
            },
            child: Container(
              width: 100,
              decoration: BoxDecoration(
                color: isSelected ? const Color.fromARGB(135, 255, 235, 59) : Colors.transparent,
                border: Border.all(
                  color: isSelected ? Color.fromARGB(255, 19, 77, 250) : Colors.transparent,
                  width: 2.0,
                ),
              ),
              child: Image.network(
                '${dotenv.env['SERVER_URL_AND_PORT']}avatars/$avatar',
                fit: BoxFit.cover,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }
}
