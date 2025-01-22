import 'dart:async';

import 'package:flutter/material.dart';
import 'package:polydiff/components/message-sidebar.dart';
import 'package:polydiff/components/user-friend-management.dart';
import 'package:polydiff/services/friends.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/theme.dart';

class FriendsPage extends StatefulWidget {
  @override
  FriendsPageState createState() => FriendsPageState();
}

class FriendsPageState extends State<FriendsPage> {
  final TextEditingController searchController = TextEditingController();
  late Timer routine;
  late List<Friend> displayedUsers = [];
  String searchQuery = '';
  int selectedUser = -1;

  @override
  void initState() {
    super.initState();
    fetchFriendsData();
    routine = Timer.periodic(Duration(seconds: 5), (Timer t) {
      fetchFriendsData();
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    routine.cancel();
    super.dispose();
  }

  Future fetchFriendsData() async {
    await FriendsService.fetchFriendsData();
    updateSearchQuery();
  }

  void focusUser(int index) {
    selectedUser = index;
    FriendsService.fetchFriendsOfSelectedUser(displayedUsers[index].id);
    setState(() {});
  }

  void refresh() {
    print('refresh');
    fetchFriendsData();
    if (selectedUser != -1)
      FriendsService.fetchFriendsOfSelectedUser(
          displayedUsers[selectedUser].id);
    setState(() {});
  }

  void updateSearchQuery() {
    displayedUsers = FriendsService.allProfiles
        .where((item) =>
            item.username.toLowerCase().contains(searchQuery.toLowerCase()))
        .toList();
    displayedUsers.sort(
        (a, b) => a.username.toLowerCase().compareTo(b.username.toLowerCase()));
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: fetchFriendsData(),
      builder: (BuildContext context, AsyncSnapshot snapshot) {
        return Scaffold(
          appBar: AppBar(
            title: Row(children: [
              Expanded(
                  flex: 3,
                  child: Text(LanguageService().translate(
                    frenchString: 'Gestion des amis',
                    englishString: 'Friends management',
                  ))),
              Expanded(
                flex: 1,
                child: TextField(
                  controller: searchController,
                  onChanged: (value) {
                    setState(() {
                      selectedUser = -1;
                      searchQuery = value;
                      updateSearchQuery();
                    });
                  },
                  decoration: InputDecoration(
                    hintText: LanguageService().translate(
                        frenchString: 'Recherche d\'amis',
                        englishString: 'Friends Search'),
                    prefixIcon: IconButton(
                      icon: Icon(Icons.search),
                      onPressed: () {
                        setState(() {
                          searchController.clear();
                          searchQuery = '';
                          updateSearchQuery();
                        });
                      },
                    ),
                  ),
                ),
              ),
            ]),
          ),
          body: Stack(
            children: [
              Row(
                children: [
                  Expanded(
                    flex: 1,
                    child: Column(children: [
                      Text(
                        LanguageService()
                            .translate(
                              frenchString: 'Tous les utilisateurs',
                              englishString: 'All users',
                            )
                            .toUpperCase(),
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 20),
                      ),
                      Expanded(
                        child: ListView.builder(
                          itemCount: displayedUsers.length,
                          itemBuilder: (context, index) {
                            return ListTile(
                              tileColor: null,
                              selectedTileColor: ThemeService
                                  .instance.currentColorScheme.secondary,
                              selectedColor: ThemeService
                                  .instance.currentColorScheme.primary,
                              selected: selectedUser == index,
                              title: UserFriendManagement(
                                  displayedUsers[index].id, refresh),
                              onTap: () => focusUser(index),
                            );
                          },
                        ),
                      ),
                    ]),
                  ),
                  Expanded(
                    flex: 1,
                    child: Column(children: [
                      Text(
                        LanguageService()
                            .translate(
                              frenchString: selectedUser != -1
                                  ? 'Amis de ${displayedUsers[selectedUser].username}'
                                  : 'Aucun utilisateur sélectionné',
                              englishString: selectedUser != -1
                                  ? 'Friends of ${displayedUsers[selectedUser].username}'
                                  : 'No user selected',
                            )
                            .toUpperCase(),
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 20),
                      ),
                      Expanded(
                        child: (FriendsService.friendsOfSelectedUser.isEmpty ||
                                selectedUser == -1)
                            ? Text(LanguageService().translate(
                                frenchString: '(Aucun ami à afficher)',
                                englishString: '(No friends to display)',
                              ))
                            : ListView.builder(
                                itemCount:
                                    FriendsService.friendsOfSelectedUser.length,
                                itemBuilder: (context, index) {
                                  return ListTile(
                                    title: UserFriendManagement(
                                        FriendsService
                                            .friendsOfSelectedUser[index],
                                        refresh),
                                  );
                                },
                              ),
                      ),
                    ]),
                  ),
                  Expanded(
                    flex: 1,
                    child: Column(
                      children: [
                        Text(
                          LanguageService()
                              .translate(
                                frenchString: 'Demandes d\'amitité reçues',
                                englishString: 'Received friend requests',
                              )
                              .toUpperCase(),
                          style: TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 20),
                        ),
                        Expanded(
                          child: FriendsService.receivedFriendRequests.isEmpty
                              ? Text(LanguageService().translate(
                                  frenchString:
                                      '(Aucune demande d\'amitié à afficher)',
                                  englishString:
                                      '(No friend requests to display)',
                                ))
                              : ListView.builder(
                                  itemCount: FriendsService
                                      .receivedFriendRequests.length,
                                  itemBuilder: (context, index) {
                                    return ListTile(
                                      title: UserFriendManagement(
                                          FriendsService
                                              .receivedFriendRequests[index],
                                          refresh),
                                    );
                                  },
                                ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              Align(
                alignment: Alignment.bottomRight,
                child: MessageSideBar(),
              ),
            ],
          ),
        );
      },
    );
  }
}
