import 'package:flutter/material.dart';

class PopupSelectLobbyComponent extends StatefulWidget {
  final List<dynamic>
      lobbies; // Type à spécifier plus précisément selon votre besoin
  final Function(String) onLobbySelected;

  PopupSelectLobbyComponent({
    Key? key,
    this.lobbies = const [],
    required this.onLobbySelected,
  }) : super(key: key);

  @override
  _PopupSelectLobbyComponentState createState() =>
      _PopupSelectLobbyComponentState();
}

class _PopupSelectLobbyComponentState extends State<PopupSelectLobbyComponent> {
  void joinLobby(String gameId) {
    print('Joining lobby with gameId: $gameId');
    widget.onLobbySelected(gameId);
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: widget.lobbies.length,
      itemBuilder: (context, index) {
        var lobby = widget.lobbies[index];
        return ListTile(
          title: ElevatedButton(
            child: Text(lobby['players'][0]['name'] ?? 'Unknown Game ID'),
            onPressed: () => joinLobby(lobby['gameId'].toString()),
          ),
        );
      },
    );
  }
}
