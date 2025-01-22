import 'package:flutter/material.dart';
import 'package:polydiff/services/friends.dart';
import 'package:polydiff/services/http-request-tool.dart';
import 'package:polydiff/services/image-from-server.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/user.dart';
import 'package:provider/provider.dart';

class UserFriendManagement extends StatefulWidget {
  final Friend friend;
  final Function refreshFunction;
  UserFriendManagement(String id, this.refreshFunction)
      : friend = FriendsService.allProfiles
            .firstWhere((element) => element.id == id);

  @override
  UserFriendManagementState createState() => UserFriendManagementState();
}

class UserFriendManagementState extends State<UserFriendManagement> {

  @override
  Widget build(BuildContext context) {
    return Consumer<AvatarProvider>(
      builder: (context, avatarProvider, child) {
        return Row(
          children: [
            avatarProvider.getAvatar(widget.friend.avatar),
            // AvatarImageFromServer.getAvatar(widget.friend.avatar),
            Expanded(
              child: Text(
                widget.friend.username,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            SizedBox(
              width: 120, // Set your desired width here
              child: ElevatedButton(
                onPressed: widget.friend.id == User.id
                    ? null
                    : () {
                        if (FriendsService.friends.contains(widget.friend.id)) {
                          // Remove friend
                          HttpRequestTool.basicPut('friends/delete/${User.id}',
                              {'receiverId': widget.friend.id});
                        } else if (FriendsService.submittedFriendRequests
                            .contains(widget.friend.id)) {
                          // Cancel friend request
                          HttpRequestTool.basicPut(
                              'friends/revokeRequest/${User.id}',
                              {'receiverId': widget.friend.id});
                        } else if (FriendsService.receivedFriendRequests
                            .contains(widget.friend.id)) {
                          // Accept friend
                          HttpRequestTool.basicPut('friends/accept/${User.id}',
                              {'senderId': widget.friend.id});
                        } else {
                          // Add friend
                          HttpRequestTool.basicPut('friends/request/${User.id}',
                              {'receiverId': widget.friend.id});
                        }
                        widget.refreshFunction();
                      },
                child: (() {
                  if (FriendsService.friends.contains(widget.friend.id)) {
                    return Text(LanguageService().translate(
                        frenchString: 'Supprimer', englishString: 'Unfriend'));
                  } else if (FriendsService.submittedFriendRequests
                      .contains(widget.friend.id)) {
                    return Text(LanguageService().translate(
                        frenchString: 'Retirer la demande',
                        englishString: 'Cancel request'));
                  } else if (widget.friend.id == User.id) {
                    return Text(LanguageService()
                        .translate(frenchString: 'Moi', englishString: 'Me'));
                  } else if (FriendsService.receivedFriendRequests
                      .contains(widget.friend.id)) {
                    return Text(LanguageService().translate(
                        frenchString: 'Accepter', englishString: 'Accept'));
                  } else {
                    return Text(LanguageService().translate(
                        frenchString: 'Ajouter', englishString: 'Add'));
                  }
                }()),
              ),
            ),
            if (FriendsService.receivedFriendRequests
                .contains(widget.friend.id))
              SizedBox(
                width: 120, // Set your desired width here
                child: ElevatedButton(
                  onPressed: () {
                    HttpRequestTool.basicPut('friends/reject/${User.id}',
                        {'senderId': widget.friend.id});
                    widget.refreshFunction();
                  },
                  child: Text(LanguageService().translate(
                      frenchString: 'Refuser', englishString: 'Reject')),
                ),
              ),
          ],
        );
      },
    );
  }
}
