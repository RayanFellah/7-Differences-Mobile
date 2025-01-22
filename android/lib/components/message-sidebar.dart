import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:polydiff/components/gif-picker.dart';
import 'package:polydiff/services/chat-mute.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/localNotificationService.dart';
import 'package:polydiff/services/socket.dart';
import 'package:polydiff/services/user.dart';

class MessageSideBar extends StatefulWidget {
  const MessageSideBar({
    super.key,
  });

  @override
  State<MessageSideBar> createState() => _MessageSideBarState();
}

class _MessageSideBarState extends State<MessageSideBar>
    with WidgetsBindingObserver {
  var showChatBox = false;
  var showChatList = true;
  var chatMessages = [];
  var chatSelected = {};
  var chatsList = [];
  var filteredChatsList = [];
  var newMessageList = [];
  var toggleButtonSelected = [true, false];
  var indexFilter = 0;
  final textController = TextEditingController();
  final ScrollController scrollCont = ScrollController();
  final txtFieldFocusNode = FocusNode();
  late AudioPlayer player = AudioPlayer();
  final MESSAGE_SOUND = 'sounds/message.mp3';
  final LanguageService languageService = LanguageService();
  late ChatMuteService chatMuteService;

  var gameChatList = [];
  var otherChatList = [];
  var afterGameFilterList = [];
  

  void scrollDown() {
    /* scrollCont.animateTo(
      scrollCont.position.maxScrollExtent,
      duration: Duration(seconds: 2),
      curve: Curves.fastOutSlowIn,
    );*/

    scrollCont.jumpTo(scrollCont.position.maxScrollExtent);
  }

  AppLifecycleState? _notification;
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    setState(() {
      _notification = state;
    });
  }

  @override
  void initState() {
    super.initState();
    player = AudioPlayer();
    player.setReleaseMode(ReleaseMode.stop);
    chatMuteService = ChatMuteService(
      onMutedPlayersListUpdated: (players) {},
      onPlayerMuted: (channelName, player) {},
      onPlayerUnmuted: (channelName, player) {},
    );

    WidgetsBinding.instance.addObserver(this);
    initSocketComportment();
    SocketService.socket.emit('getChatList');
  }

  @override
  void dispose() {
    textController.dispose();
    //player.dispose();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  bool isGameChannel(String channelName) {
    final gameChannelRegex = RegExp(r'^\d*\.\d*$');
    return gameChannelRegex.hasMatch(channelName);
  }


  initSocketComportment() {
    SocketService.socket.on('updatedChatList', (data) {
      if(mounted) {
      setState(() {
        chatsList = data;
        gameChatList = chatsList.where((element) => isGameChannel(element['name'])).toList();
        otherChatList = chatsList.where((element) => !isGameChannel(element['name'])).toList();
        filteredChatsList = chatsList;

        filterChannel(indexFilter);
        filterChannel(indexFilter);
        SocketService.socket.emit('getMyChannels', {'username': User.username});
      });
      }
    });

    SocketService.socket.on('updatedHistory', (data) {
      if (mounted){
      setState(() {
        if (_notification == AppLifecycleState.paused) {
          if ((User.chatNameList.contains(data['name']) ||
                  data['name'] == 'general') &&
              data['history'].last['sender'] != User.username) {
            LocalNotificationService().showNotificationAndroid(
                data['name'], data['history'].last['body']);
          }
        } else {
          var lastMessageInChatList = chatsList
              .firstWhere((e) => e['name'] == data['name'])['history']
              .last;
          if (showChatBox && chatSelected['name'] == data['name']) {
            chatMessages = data['history'];
            SocketService.socket.emit('getChatList');
            scrollDown();
          } else if ((User.chatNameList.contains(data['name']) ||
                  data['name'] == 'general') &&
              (data['history'].last['time'] != lastMessageInChatList['time'] ||
                  data['history'].last['body'] !=
                      lastMessageInChatList['body'])) {
            newMessageList.add(data['name']);
            player.play(AssetSource(MESSAGE_SOUND));
            SocketService.socket.emit('getChatList');
          }
        }
      });
      }
    });
    SocketService.socket.on('updateChannelList', (data) {
       if (mounted){
      setState(() {
        SocketService.socket.emit('getMyChannels', {'username': User.username});
        SocketService.socket.emit('getMyChannels', {'username': User.username});
      });
    }
    });

    SocketService.socket.on('updatedMyChannels', (data) {
      if(mounted){
      setState(() {
        User.chatNameList = List<String>.from(data.map((e) => e['name']));
      });
    }
    });
  }

  chatDisplay(int index) {
    setState(() {
      chatSelected = filteredChatsList[index];
      SocketService.socket.emit('getChatHistory', chatSelected['name']);
      newMessageList.removeWhere((element) => element == chatSelected['name']);
      print(newMessageList);
      showChatList = false;
    });
  }

  removeTempChat() {
    setState(() {
      filteredChatsList.removeWhere((element) => element['name'] == 'temp');
    });
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, constraints) {
      return showChatBox
          ? Align(
              alignment: Alignment.bottomRight,
              child: Container(
                  height: constraints.maxHeight * 0.85, //0.7
                  width: constraints.maxWidth * 0.35, //0.27
                  decoration: BoxDecoration(
                    border: Border(
                      top: BorderSide(
                          color: Theme.of(context).colorScheme.primary,
                          width: 2),
                      left: BorderSide(
                          color: Theme.of(context).colorScheme.primary,
                          width: 2),
                    ),
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(10),
                      topRight: Radius.circular(10),
                    ),
                    color: Theme.of(context).colorScheme.surface,
                  ),
                  child: Column(children: [
                    Row(
                      mainAxisSize: MainAxisSize.max,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        TextButton(
                          onPressed: () {
                            setState(() {
                              showChatList = true;
                              chatSelected = {};
                            });
                          },
                          child: Stack(children: <Widget>[
                            FittedBox(
                              child: Icon(Icons.arrow_back_rounded),
                            ),
                            Align(
                              alignment: Alignment.topRight,
                              child: (newMessageList.isNotEmpty &&
                                      !showChatList)
                                  ? CircleAvatar(
                                      radius: 5,
                                      backgroundColor: Colors.red,
                                      child:
                                          Text(newMessageList.length.toString(),
                                              style: TextStyle(
                                                fontSize: 7,
                                                color: Colors.white,
                                              )),
                                    )
                                  : null,
                            )
                          ]),
                        ),
                        chatSelected['name'] == null
                            ? SizedBox(
                                child: Text(
                                  'Chat',
                                  style: TextStyle(
                                    fontSize: 25,
                                    fontWeight: FontWeight.bold,
                                    color:
                                        Theme.of(context).colorScheme.primary,
                                    overflow: TextOverflow.fade,
                                  ),
                                ),
                              )
                            : SizedBox(
                                width: constraints.maxWidth * 0.15,
                                child: Center(
                                  child: Text(
                                    chatSelected['name'],
                                    maxLines: 1,
                                    style: TextStyle(
                                        fontSize: 25,
                                        fontWeight: FontWeight.bold,
                                        color: Theme.of(context)
                                            .colorScheme
                                            .primary),
                                    overflow: TextOverflow.fade,
                                  ),
                                ),
                              ),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              showChatBox = false;
                            });
                          },
                          child: Icon(Icons.horizontal_rule_rounded),
                        ),
                      ],
                    ),
                    if (showChatList) ...[
                      Row(children: [
                        ToggleButtons(
                            isSelected: toggleButtonSelected,
                            borderColor:
                                Theme.of(context).colorScheme.onSurface,
                            selectedBorderColor:
                                Theme.of(context).colorScheme.onSurface,
                            onPressed: (int index) {
                              indexFilter = index;
                              filterChannel(index);
                              switch (index) {
                                case 0:
                                  setState(() {
                                    filteredChatsList = otherChatList; //here 
                                    
                                  });
                                  break;
                                case 1:
                                  setState(() {
                                    afterGameFilterList = [gameChatList ,otherChatList];
                                    filteredChatsList = afterGameFilterList
                                        .where((element) => User.chatNameList
                                            .contains(element['name']))
                                      .toList();     
                                  });
                                  break;
                              }
                            },
                            borderRadius: BorderRadius.circular(10),
                            children: [
                              Text(languageService.translate(
                                  englishString: 'All', frenchString: 'Tous')),
                              Text(languageService.translate(
                                  englishString: 'My channels',
                                  frenchString: 'Mes canaux')),
                            ]),
                        Spacer(),
                        OutlinedButton(
                            onPressed: () {
                              setState(() {
                                filteredChatsList.insert(0, {'name': 'temp'});
                              });
                            },
                            style: OutlinedButton.styleFrom(
                              padding: EdgeInsets.all(10),
                              foregroundColor: Colors.green,
                            ),
                            child: Icon(Icons.group_add_outlined)),
                      ]),
                      TextField(
                        decoration: InputDecoration(
                          labelText: 'Rechercher un canal',
                          prefixIcon: Icon(Icons.search),
                        ),
                        onChanged: (value) {
                          setState(() {
                            filteredChatsList = chatsList
                                .where((element) => element['name']
                                    .toLowerCase()
                                    .contains(value.toLowerCase()))
                                .toList();
                          });
                        },
                      ),
                      ChatList(
                          showChatMessages: chatDisplay,
                          filteredChatsList: filteredChatsList,
                          chatsList: chatsList,
                          removeTempChat: removeTempChat,
                          newMessageList: newMessageList,
                          toggleButtonSelected: toggleButtonSelected,),
                          
                    ] else ...[
                      ChatMessages(
                        chatMessages: chatMessages,
                        textController: textController,
                        scrollCont: scrollCont,
                        txtFieldFocusNode: txtFieldFocusNode,
                        chatSelected: chatSelected,
                        isUserMuted: (String sender) => chatMuteService
                            .isPlayerMuted(chatSelected['name'], sender),
                      ),
                    ]
                  ])),
            )
          : FittedBox(
              child: Align(
                alignment: Alignment.bottomRight,
                child: Stack(children: <Widget>[
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      shape: CircleBorder(),
                      padding: EdgeInsets.all(10),
                    ),
                    onPressed: () {
                      setState(() {
                        showChatBox = true;
                      });
                    },
                    child: Stack(children: [
                      Icon(
                        Icons.message,
                        color: Theme.of(context).colorScheme.primary,
                        size: 50,
                      ),
                      Align(
                        alignment: Alignment.topRight,
                        child: (newMessageList.isNotEmpty)
                            ? CircleAvatar(
                                radius: 10,
                                backgroundColor: Colors.red,
                                child: Text(newMessageList.length.toString(),
                                    style: TextStyle(
                                      fontSize: 15,
                                      color: Colors.white,
                                    )),
                              )
                            : null,
                      )
                    ]),
                  ),
                ]),
              ),
            );
    });
  }

  void filterChannel(int index) {
    setState(() {
      for (int buttonIndex = 0;
          buttonIndex < toggleButtonSelected.length;
          buttonIndex++) {
        if (buttonIndex == index) {
          toggleButtonSelected[buttonIndex] = true;
        } else {
          toggleButtonSelected[buttonIndex] = false;
        }
      }
    });
    switch (index) {
      case 0:
        setState(() {
          filteredChatsList = chatsList;
        });
        break;
      case 1:
        setState(() {
          filteredChatsList = chatsList
              .where((element) => User.chatNameList.contains(element['name']))
              .toList();
        });
        break;
      case 2:
        setState(() {
          filteredChatsList = chatsList
              .where((element) => !User.chatNameList.contains(element['name']))
              .toList();
        });
        break;
    }
  }
}



class ChatMessages extends StatelessWidget {
  const ChatMessages({
    Key? key,
    required this.chatMessages,
    required this.textController,
    required this.scrollCont,
    required this.txtFieldFocusNode,
    required this.chatSelected,
    required this.isUserMuted, // Ajoutez ceci
  }) : super(key: key);

  final List chatMessages;
  final TextEditingController textController;
  final ScrollController scrollCont;
  final FocusNode txtFieldFocusNode;
  final dynamic chatSelected;
  final bool Function(String sender) isUserMuted;

  void sendMessage(String message) {
    if (message.trim() != '') {
      SocketService.socket.emit('updateChatHistory', {
        'senderType': 1,
        'sender': User.username,
        'body': message,
        'time': DateTime.now().toString().split('.')[0].split(' ')[1],
        'chatName': '${chatSelected['name']}',
        'avatar': User.avatarFileName, //add avatar 
      });
      textController.clear();
    } else {
      print('empty message');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: scrollCont,
              itemCount: chatMessages.length,
              itemBuilder: (context, index) {
                var i = chatMessages[index];
                var sender = i['sender'];
                bool isGif = i['body'].contains('.gif');
                bool isMuted = isUserMuted(sender);
                print('Sender: $sender, isMuted: $isMuted');

                if (isGif) {
                  return Card(
                    child: ListTile(
                      leading: i['sender'] == User.username
                          ? null
                          : Image.network(
                              '${dotenv.env['SERVER_URL_AND_PORT']}avatars/${i['avatar']}'),
                      trailing:
                          i['sender'] == User.username ? User.avatar : null,
                      title: Image.network(i['body'],
                          fit: BoxFit.cover), // affichage GIF
                      subtitle: Text(i['sender'] + ' ' + i['time'],
                          style: TextStyle(fontSize: 10),
                          textAlign: i['sender'] == User.username
                              ? TextAlign.right
                              : TextAlign.left),
                      tileColor: i['sender'] == User.username
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).colorScheme.secondary,
                      textColor: i['sender'] == User.username
                          ? Theme.of(context).colorScheme.onPrimary
                          : Theme.of(context).colorScheme.onSecondary,
                    ),
                  );
                } else if (i['sender'] == 'SYSTEM') {
                  return Text(i['body'],
                      style: TextStyle(
                        fontSize: 15,
                        color: Theme.of(context).colorScheme.secondary,
                      ),
                      textAlign: TextAlign.center);
                } else if (isMuted) {
                  print('Message de $sender ignoré');
                  return Card();
                } else {
                  return Card(
                    child: ListTile(
                      leading: i['sender'] == User.username
                          ? null
                          : Image.network(
                              '${dotenv.env['SERVER_URL_AND_PORT']}avatars/${i['avatar']}'),
                      trailing:
                          i['sender'] == User.username ? User.avatar : null,
                      title: Text(i['body'],
                          textAlign: i['sender'] == User.username
                              ? TextAlign.right
                              : TextAlign.left),
                      subtitle: Text(i['sender'] + ' ' + i['time'],
                          style: TextStyle(fontSize: 10),
                          textAlign: i['sender'] == User.username
                              ? TextAlign.right
                              : TextAlign.left),
                      tileColor: i['sender'] == User.username
                          ? Theme.of(context).colorScheme.primary
                          : Theme.of(context).colorScheme.secondary,
                      textColor: i['sender'] == User.username
                          ? Theme.of(context).colorScheme.onPrimary
                          : Theme.of(context).colorScheme.onSecondary,
                    ),
                  );
                }
              },
            ),
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: Row(
              children: [
                IconButton(
                  icon: Icon(Icons.gif),
                  onPressed: () async {
                    final gifUrl = await showModalBottomSheet<String>(
                      context: context,
                      isScrollControlled: true,
                      builder: (context) => Padding(
                        padding: EdgeInsets.only(
                          bottom: MediaQuery.of(context).viewInsets.bottom,
                        ),
                        child: GifPicker(),
                      ),
                    );
                    if (gifUrl != null) {
                      sendMessage(gifUrl);
                    }
                  },
                ),
                Expanded(
                  child: TextField(
                    focusNode: txtFieldFocusNode,
                    controller: textController,
                    decoration: InputDecoration(
                      hintText: 'Type a message',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (value) {
                      sendMessage(value);
                      txtFieldFocusNode.requestFocus();
                    },
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.send),
                  onPressed: () {
                    sendMessage(textController.text);
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ChatList extends StatefulWidget {
  final Function(int) showChatMessages;
  final Function() removeTempChat;
  final List chatsList;
  final List filteredChatsList;
  final List newMessageList;
  final List toggleButtonSelected; 
  const ChatList(
      {super.key,
      required this.showChatMessages,
      required this.chatsList,
      required this.removeTempChat,
      required this.filteredChatsList,
      required this.newMessageList,
      required this.toggleButtonSelected});
      

  @override
  State<ChatList> createState() => _ChatListState();
}

class _ChatListState extends State<ChatList> {
  late ChatMuteService chatMuteService;
  List<Map<String, dynamic>> players = [];

  void initState() {
    super.initState();
    chatMuteService = ChatMuteService(
      onMutedPlayersListUpdated: (List<dynamic> playersData) {
        setState(() {
          players = playersData
              .map<Map<String, dynamic>>(
                  (player) => player as Map<String, dynamic>)
              .toList();
        });
      },
      onPlayerMuted: (String channelName, String player) {},
      onPlayerUnmuted: (String channelName, String player) {},
    );
  }

  void _showPlayersDialog(BuildContext context, String channelName) async {
    List<String> playersInChat =
        await chatMuteService.getPlayersInChat(channelName);

    Map<String, List<String>> mutedPlayersResult = await chatMuteService
        .getMutedPlayersInChannel(channelName, User.username);
    List<String> mutedPlayers = mutedPlayersResult[channelName] ?? [];

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: Text("Joueurs dans le canal $channelName"),
              content: SingleChildScrollView(
                child: ListBody(
                  children: playersInChat.map((player) {
                    bool isMuted = mutedPlayers.contains(player);
                    return ListTile(
                      title: Text(player),
                      trailing: IconButton(
                        icon:
                            Icon(isMuted ? Icons.volume_off : Icons.volume_up),
                        onPressed: () {
                          if (isMuted) {
                            chatMuteService.unmutePlayer(
                                User.username, channelName, player);
                            setState(() {
                              mutedPlayers.remove(player);
                            });
                          } else {
                            chatMuteService.mutePlayer(
                                User.username, channelName, player);
                            setState(() {
                              mutedPlayers.add(player);
                            });
                          }
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),
              actions: <Widget>[
                TextButton(
                  child: Text('Fermer'),
                  onPressed: () => Navigator.of(dialogContext).pop(),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: ListView.builder(
        itemCount: widget.filteredChatsList.length,
        itemBuilder: (context, index) {
          return OutlinedButton(
            style: OutlinedButton.styleFrom(
              side: BorderSide(
                color: Theme.of(context).colorScheme.onSurface,
              ),
            ),
            onPressed: () {
              (User.chatNameList
                          .contains(widget.filteredChatsList[index]['name']) ||
                      widget.filteredChatsList[index]['name'] == 'general')
                  ? widget.showChatMessages(index)
                  : null;
            },
            child: widget.filteredChatsList[index]['name'] == 'temp'
                ? TextField(
                    decoration: InputDecoration(
                      labelText: 'Nom du canal',
                    ),
                    onTapOutside: (event) {
                      widget.removeTempChat();
                    },
                    autofocus: true,
                    onSubmitted: (value) {
                      if (value.trim() == '' ||
                          value == 'temp' ||
                          widget.chatsList
                              .any((element) => element['name'] == value)) {
                        widget.removeTempChat();
                        return;
                      }
                      SocketService.socket.emit('createChat', {
                        'name': value,
                        'creatorName': User.username,
                        'history': [
                          {
                            'senderType': 0,
                            'sender': 'SYSTEM',
                            'body': 'Welcome to the $value chat!',
                            'time': DateTime.now()
                                .toString()
                                .split('.')[0]
                                .split(' ')[1],
                          }
                        ],
                        'playersInChat': [User.username]
                      });
                      print(User.username);
                      widget.removeTempChat();
                    },
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      (widget.newMessageList.contains(
                                  widget.filteredChatsList[index]['name']) &&
                              User.chatNameList.contains(
                                  widget.filteredChatsList[index]['name']))
                          ? CircleAvatar(
                              radius: 5,
                              backgroundColor: Colors.red,
                            )
                          : Text(''),
                      Text(
                        widget.filteredChatsList[index]['name'],
                        style: TextStyle(
                          fontSize: 20,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        overflow: TextOverflow.fade,
                      ),
                      widget.filteredChatsList[index]['creatorName'] ==
                              User.username
                          ? Text(' 👑')
                          : Text(''),
                      Spacer(),
                      if(widget.toggleButtonSelected[1]) ...[ 
                      IconButton(
                          icon: Icon(Icons.remove_red_eye),
                          onPressed: () => _showPlayersDialog(
                              context, widget.filteredChatsList[index]['name']),
                          color: const Color.fromARGB(255, 147, 166, 182),
                        ),
                      ],
                      if (widget.filteredChatsList[index]['name'] !=
                          'general') ...[
                        
                        if (widget.filteredChatsList[index]['creatorName'] ==
                            User.username)
                          IconButton(
                              onPressed: () {
                                SocketService.socket.emit('deleteChannel',
                                    widget.filteredChatsList[index]['name']);
                                SocketService.socket.emit('getChatList');
                              },
                              icon: Icon(Icons.delete, color: Colors.red))
                        else
                          User.chatNameList.contains(
                                  widget.filteredChatsList[index]['name'])
                              ? IconButton(
                                  icon: Icon(Icons.indeterminate_check_box),
                                  onPressed: () {
                                    SocketService.socket.emit('leaveChannel', {
                                      'channelName': widget
                                          .filteredChatsList[index]['name'],
                                      'username': User.username
                                    });
                                    print(User.username);

                                    SocketService.socket.emit('getMyChannels',
                                        {'username': User.username});
                                  },
                                  color: Colors.red)
                              : IconButton(
                                  icon: Icon(Icons.add_box),
                                  onPressed: () {
                                    SocketService.socket.emit('joinChannel', {
                                      'username': User.username,
                                      'channelName': widget
                                          .filteredChatsList[index]['name']
                                    });
                                  },
                                  color: Colors.green)
                      ],
                    ],
                  ),
          );
        },
      ),
    );
  }
}
