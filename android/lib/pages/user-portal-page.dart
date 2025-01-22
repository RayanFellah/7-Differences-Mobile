import 'package:flutter/material.dart';
import 'package:polydiff/components/avatar-modification.dart';
import 'package:polydiff/components/connection-history-table.dart';
import 'package:polydiff/components/game-history-table.dart';
import 'package:polydiff/components/message-sidebar.dart';
import 'package:polydiff/components/pseudo-modification.dart';
import 'package:polydiff/components/replay-history-table.dart';
import 'package:polydiff/components/sounds-selection.dart';
import 'package:polydiff/components/user-statistics-table.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/theme.dart';
import 'package:polydiff/services/user.dart';

class UserSettingsPage extends StatefulWidget {
  final Function refreshUserData;
  final Function refreshButtonsLabel;
  UserSettingsPage(this.refreshUserData, this.refreshButtonsLabel);

  @override
  UserSettingsPageState createState() => UserSettingsPageState();
}

class UserSettingsPageState extends State<UserSettingsPage> {
  ThemeService themeService = ThemeService();

  @override
  void initState() {
    super.initState();

    // Refresh data
    refreshUserStatistics();
  }

  // This will trigger a rebuild of the widget needed to avoid async methods on init.
  refreshUserStatistics() async {
    await User.loadGameHistory();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(LanguageService().translate(
            frenchString: 'Paramètres de compte',
            englishString: 'User settings')),
      ),
      body: Stack(
        children: [
          Padding(
            padding: EdgeInsets.only(top: 10.0),
            child: SingleChildScrollView(
              child: Column(
                children: [
                  Container(
                    margin: EdgeInsets.all(10), // Add spacing around the panel
                    decoration: BoxDecoration(
                      borderRadius:
                          BorderRadius.circular(20), // Round the corners
                    ),
                    child: ExpansionPanelList.radio(
                      initialOpenPanelValue: null,
                      expansionCallback: (int index, bool isExpanded) {
                        setState(() {});
                      },
                      children: [
                        ExpansionPanelRadio(
                          value: 0,
                          headerBuilder:
                              (BuildContext context, bool isExpanded) {
                            return HeaderText(
                              LanguageService().translate(
                                  frenchString: 'Statistiques',
                                  englishString: 'Statistics'),
                            );
                          },
                          body: UserStatisticsTable(),
                        ),
                        ExpansionPanelRadio(
                          value: 1,
                          headerBuilder:
                              (BuildContext context, bool isExpanded) {
                            return HeaderText(
                              LanguageService().translate(
                                  frenchString: 'Modifier le pseudonyme',
                                  englishString: 'Modify username'),
                            );
                          },
                          body: Column(children: [
                            PseudoModification(widget.refreshUserData),
                            SizedBox(height: 20),
                          ]),
                        ),
                        ExpansionPanelRadio(
                          value: 2,
                          headerBuilder:
                              (BuildContext context, bool isExpanded) {
                            return HeaderText(
                              LanguageService().translate(
                                  frenchString: "Modifier l'avatar",
                                  englishString: 'Modify avatar'),
                            );
                          },
                          body: AvatarModification(widget.refreshUserData),
                        ),
                        ExpansionPanelRadio(
                          value: 3,
                          headerBuilder:
                              (BuildContext context, bool isExpanded) {
                            return HeaderText(
                              LanguageService().translate(
                                  frenchString: 'Historique de connexion',
                                  englishString: 'Connection history'),
                            );
                          },
                          body: Column(children: [
                            ConnectionHistoryTable(),
                            SizedBox(height: 20),
                          ]),
                        ),
                        ExpansionPanelRadio(
                            value: 4,
                            headerBuilder:
                                (BuildContext context, bool isExpanded) {
                              return HeaderText(
                                LanguageService().translate(
                                    frenchString: 'Historique de parties',
                                    englishString: 'Game history'),
                              );
                            },
                            body: Column(children: [
                              GameHistoryTable(),
                              SizedBox(height: 20),
                            ])),
                        ExpansionPanelRadio(
                            value: 5,
                            headerBuilder:
                                (BuildContext context, bool isExpanded) {
                              return HeaderText(
                                LanguageService().translate(
                                    frenchString: 'Visionner un enregistrement',
                                    englishString: 'Watch a replay'),
                              );
                            },
                            body: Column(children: [
                              ReplayHistoryTable(
                                  data: User.replayHistory.map((entry) {
                                    return MapEntry(
                                        entry.dateHeure, entry.action);
                                  }).toList(),
                                  dataLabel1: LanguageService.instance
                                      .translate(
                                          frenchString: 'Visionner',
                                          englishString: 'Play'),
                                  dataLabel2: LanguageService.instance
                                      .translate(
                                          frenchString: 'Effacer',
                                          englishString: 'Delete')),
                              SizedBox(height: 20),
                            ])),
                        ExpansionPanelRadio(
                          value: 6,
                          headerBuilder:
                              (BuildContext context, bool isExpanded) {
                            return HeaderText(
                              LanguageService().translate(
                                  frenchString: 'Choix de sons spéciaux',
                                  englishString: 'Choose special sounds'),
                            );
                          },
                          body: Column(children: [
                            SoundsSelection(),
                            SizedBox(height: 20),
                          ]),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: <Widget>[
                        Text(
                          LanguageService().translate(
                              frenchString: "Thème de l'application",
                              englishString: 'Application theme'),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: <Widget>[
                            Icon(themeService.isThemeDark
                                ? Icons.toggle_on
                                : Icons.toggle_off),
                            Text(themeService.isThemeDark ? '🌑' : '🔆'),
                          ],
                        ),
                      ],
                    ),
                    onPressed: () {
                      setState(() {
                        themeService.selectTheme(!themeService.isThemeDark);
                      });
                    },
                  ),
                  ElevatedButton(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: <Widget>[
                        Text(
                          LanguageService().translate(
                              frenchString: "Langue de l'application",
                              englishString: 'Application language'),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: <Widget>[
                            Icon(LanguageService().isLanguageFrench
                                ? Icons.toggle_on
                                : Icons.toggle_off),
                            Text(LanguageService().isLanguageFrench
                                ? 'fr'
                                : 'en'),
                          ],
                        ),
                      ],
                    ),
                    onPressed: () {
                      setState(() {
                        LanguageService().selectLanguage(
                            !LanguageService().isLanguageFrench);
                        widget.refreshButtonsLabel();
                      });
                    },
                  ),
                ],
              ),
            ),
          ),
          Align(
            alignment: Alignment.bottomRight,
            child: MessageSideBar(),
          ),
        ],
      ),
    );
  }
}

class HeaderText extends StatelessWidget {
  final String text;
  HeaderText(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(left: 20, top: 10, right: 10, bottom: 10),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 16,
        ),
      ),
    );
  }
}
