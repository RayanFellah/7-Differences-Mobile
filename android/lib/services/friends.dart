import 'dart:convert';

import 'package:polydiff/interfaces/game-access-type.dart';
import 'package:polydiff/services/http-request-tool.dart';
import 'package:polydiff/services/user.dart';

class FriendsService {
  static List<Friend> allProfiles = [];
  static List<String> friends = [];
  static List<String> receivedFriendRequests = [];
  static List<String> submittedFriendRequests = [];
  static List<String> friendsOfSelectedUser = [];

  static fetchFriendsData() async {
    var res = await HttpRequestTool.basicGet('friends/all');
    allProfiles = (jsonDecode(res.body) as List<dynamic>)
        .map((friend) => Friend(
            username: friend['username'],
            avatar: friend['avatar'] ?? 'avatar1.png',
            id: friend['id']))
        .toList();

    res = await HttpRequestTool.basicGet('friends/${User.id}');
    if (res.statusCode != 200) {
      friends = [];
    } else {
      friends = (jsonDecode(res.body) as List<dynamic>).cast<String>();
    }

    res = await HttpRequestTool.basicGet('friends/pending/${User.id}');
    if (res.statusCode != 200) {
      receivedFriendRequests = [];
      submittedFriendRequests = [];
    } else {
      var body = jsonDecode(res.body);
      if (body['receivedRequests'] == null) {
        receivedFriendRequests = [];
      } else {
        receivedFriendRequests = (body['receivedRequests'] as List<dynamic>)
            .map((id) => id.toString()).toList();
      }
      if (body['submittedRequests'] == null) {
        submittedFriendRequests = [];
      } else {
        submittedFriendRequests = (body['submittedRequests'] as List<dynamic>)
            .map((id) => id.toString()).toList();
      }
    }
  }
  static void fetchFriendsOfSelectedUser(String id) async {
    var res = await HttpRequestTool.basicGet('friends/$id');
    if (res.statusCode != 200) {
      friendsOfSelectedUser = [];
    } else {
      friendsOfSelectedUser = (jsonDecode(res.body) as List<dynamic>).cast<String>();
    }
  }
  static Future<bool> isUserAllowedInGame(dynamic game) async {
    if (game['gameAccessType'] != GameAccessType.ALL.index) {
      String gameCreatorUserName = game['players'][0]['name'];
      print('gameCreatorUserName: $gameCreatorUserName');
      var res = await HttpRequestTool.basicGet(
          'friends/byUsername/$gameCreatorUserName');
      if (res.body.isEmpty) {
        return false;
      }
      List creatorFriends = jsonDecode(res.body);
    if (game['gameAccessType'] == GameAccessType.FRIENDS_ONLY.index) {
      if (!creatorFriends.contains(User.id)) {
        return false;
      }
    } else if (game['gameAccessType'] ==
        GameAccessType.FRIENDS_AND_THEIR_FRIENDS.index) {
      List<String> allowedUsers = List<String>.from(creatorFriends);

      for (String friend in creatorFriends) {
        var res = await HttpRequestTool.basicGet('friends/$friend');
        if (res.body.isNotEmpty) {
        List<String> friendsOfFriend = List<String>.from(
            jsonDecode(res.body).map((item) => item.toString()));
        allowedUsers.addAll(friendsOfFriend);
        }
      }
      if (!allowedUsers.contains(User.id)) {
        return false;
      }
    }
  }
  return true;
}
}

class Friend {
  String username;
  String avatar;
  String id;

  Friend({required this.username, required this.avatar, required this.id});
}
