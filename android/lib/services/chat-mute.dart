import 'dart:async';

import 'package:flutter/material.dart';
import 'package:polydiff/services/socket.dart';

class ChatMuteService extends ChangeNotifier {
  final Function(List<dynamic>) onMutedPlayersListUpdated;
  final Function(String, String) onPlayerMuted;
  final Function(String, String) onPlayerUnmuted;
    Map<String, List<String>> mutedPlayersPerChannel = {};
    ValueNotifier<Map<String, List<String>>> mutedPlayersPerChannelNotifier = ValueNotifier({});



  ChatMuteService({
    required this.onMutedPlayersListUpdated,
    required this.onPlayerMuted,
    required this.onPlayerUnmuted,
  }) {
    setupEventListeners();
  }

  void setupEventListeners() {
    
    SocketService.socket.on('mutedPlayersResponse', (mutedPlayers) {
      onMutedPlayersListUpdated(mutedPlayers);
    });

    SocketService.socket.on('playerMuted', (data) {
      onPlayerMuted(data['channelName'], data['playerToMute']);
    });

    SocketService.socket.on('playerUnmuted', (data) {
      onPlayerUnmuted(data['channelName'], data['playerToUnmute']);
    });
  }


Future<List<String>> getPlayersInChat(String channelName) async {
  Completer<List<String>> completer = Completer();

  SocketService.socket.emit('requestPlayersInChat', {'channelName': channelName});
  SocketService.socket.once('responsePlayersInChat', (data) {
    completer.complete(List<String>.from(data['playersInChat']));
  });

  return completer.future;
}


Future<Map<String, List<String>>> getMutedPlayersInChannel(String channelName, String username) async {
  Completer<Map<String, List<String>>> completer = Completer();

  SocketService.socket.emit('getMutedPlayersInChannel', {
    'channelName': channelName,
    'username': username 
  });

  SocketService.socket.once('mutedPlayersPerChannelResponse', (data) {
    if (data is Map) {
      var mutedPlayers = Map.from(data).map((key, value) {
        return MapEntry(key as String, List<String>.from(value));
      });
      completer.complete(mutedPlayers);
    } else {
      completer.completeError('Data format is not correct');
    }
  });

  return completer.future;
}

  
  void mutePlayer(String username, String channelName, String playerToMute) {
    SocketService.socket.emit('mutePlayerInChannel', {
      'username': username,
      'channelName': channelName,
      'playerToMute': playerToMute,
    });

    final currentMutedPlayers = mutedPlayersPerChannelNotifier.value;
    final mutedPlayers = currentMutedPlayers[channelName] ?? [];
    mutedPlayers.add(playerToMute);
    currentMutedPlayers[channelName] = mutedPlayers;

    mutedPlayersPerChannelNotifier.value = Map.from(currentMutedPlayers);
  }

  void unmutePlayer(String username, String channelName, String playerToUnmute) {
    SocketService.socket.emit('unmutePlayerInChannel', {
      'username': username,
      'channelName': channelName,
      'playerToUnmute': playerToUnmute,
    });

    final currentMutedPlayers = mutedPlayersPerChannelNotifier.value;
    final mutedPlayers = currentMutedPlayers[channelName]?.where((player) => player != playerToUnmute).toList() ?? [];
    currentMutedPlayers[channelName] = mutedPlayers;

    mutedPlayersPerChannelNotifier.value = Map.from(currentMutedPlayers);
    
  }

   bool isPlayerMuted(String channelName, String playerName) {
    print("isPlayerMuted called");
    return mutedPlayersPerChannel[channelName]?.contains(playerName) ?? false;
  }

  // void toggleMutePlayer(String channelName, String player) {
  //     mutedPlayersPerChannel[channelName] ??= [];
  //   if (mutedPlayersPerChannel[channelName]!.contains(player)) {
  //     unmutePlayer(channelName, player);
  //     print("Joueur $player démuté dans le canal $channelName");

  //   } else {
  //     mutePlayer(channelName, player);
  //     print("Joueur $player muté dans le canal $channelName");

  //   }
  // }

  //  void getMutedPlayers(String channelName) {
  //   SocketService.socket.emit('getMutedPlayersInChannel', {
  //     'channelName': channelName,
  //   });
  // }

 
}
