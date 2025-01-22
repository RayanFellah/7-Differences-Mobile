import 'package:flutter/material.dart';
import 'package:polydiff/services/http-request-tool.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/user.dart';

class PseudoModification extends StatefulWidget {
  final Function refreshUserData;
  PseudoModification(this.refreshUserData);

  @override
  PseudoModificationState createState() => PseudoModificationState();
}

class PseudoModificationState extends State<PseudoModification> {
  final TextEditingController pseudo = TextEditingController();
  late TextFormField pseudoForm;
  final _formKey = GlobalKey<FormState>();

  void sendToServer(String value) async {
    var response =
        await HttpRequestTool.basicPut('api/fs/players/${User.username}/username', {
      'username': value,
    });
    print(response.statusCode);
    if (response.statusCode == 200) {
      User.username = value;
      widget.refreshUserData();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(
        LanguageService().translate(
            frenchString: 'Le pseudonyme est déjà pris.',
            englishString: 'Username already taken'),
      )));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(left: 20),
      child: Row(children: <Widget>[
        Expanded(
          child: Form(
              key: _formKey,
              child: TextFormField(
                controller: pseudo,
                decoration: InputDecoration(
                  labelText: 
                  LanguageService().translate(
                    frenchString: 'Entrez votre nouveau pseudonyme',
                    englishString: 'Enter your new username'
                )),
                validator: (value) {
                  RegExp regex = RegExp(r'^[a-zA-Z0-9]+$');
                  if (value == User.username){return null;}
                  if (
                      value == null ||
                      value.isEmpty ||
                      value.length > 16 ||
                      !regex.hasMatch(value)) {
                    return LanguageService().translate(
                      frenchString: 'Le pseudonyme doit contenir entre 1 et 16 lettres et/ou chiffres.',
                      englishString: 'Username must contain between 1 and 16 letters and/or numbers.'
                    );
                  }
                  sendToServer(value);
                  return null;
                },
              )),
        ),
        ElevatedButton(
          child: Text(
            LanguageService().translate(
              frenchString: 'Confirmer',
              englishString: 'Confirm'
            ),
          ),
          onPressed: () {
            if (_formKey.currentState != null &&
                _formKey.currentState!.validate()) {
              print(pseudo.text);
            }
          },
        ),
      ]),
    );
  }
}
