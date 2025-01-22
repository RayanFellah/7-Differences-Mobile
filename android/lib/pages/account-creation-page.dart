import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:polydiff/components/avatar-selector.dart';
import 'package:polydiff/components/custom-text-field.dart';
import 'package:polydiff/pages/main-page.dart';
import 'package:polydiff/services/language.dart';
import 'package:polydiff/services/login.dart';

class AccountCreationPage extends StatefulWidget {
  @override
  _AccountCreationPageState createState() => _AccountCreationPageState();
}

class _AccountCreationPageState extends State<AccountCreationPage> {
  final TextEditingController pseudo = TextEditingController();
  final TextEditingController email = TextEditingController();
  final TextEditingController password = TextEditingController();
  late ValidatedCustomTextField pseudoForm;
  late ValidatedCustomTextField emailForm;
  late ValidatedCustomTextField passwordForm1;
  late ValidatedCustomTextField passwordForm2;
  late AppBar _appBar;
  late AvatarSelector avatarSelector;
  late ElevatedButton validateButton;
  var selectedAvatar;
  final _formKey = GlobalKey<FormState>();

  _AccountCreationPageState() {
    _appBar = AppBar(
      title: Text(
        LanguageService()
            .translate(frenchString: 'Inscription', englishString: 'Sign up'),
      ),
    );

    pseudoForm = ValidatedCustomTextField(
      controller: pseudo,
      labelText: LanguageService().translate(
          frenchString: 'Nom d\'utilisateur :', englishString: 'Username :'),
      obscureText: false,
      validator: (value) {
        RegExp regex = RegExp(r'^[a-zA-Z0-9]+$');
        if (value == null ||
            value.isEmpty ||
            value.length > 16 ||
            !regex.hasMatch(value)) {
          return LanguageService().translate(
              frenchString:
                  'Le pseudonyme doit contenir entre 1 et 16 lettres et/ou chiffres.',
              englishString:
                  'Username must contain between 1 and 16 letters and/or numbers.');
        }
        return null;
      },
    );
    emailForm = ValidatedCustomTextField(
      controller: email,
      labelText: 'Email :',
      validator: (value) {
        RegExp regex = RegExp(r'^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z]+$');
        if (value == null ||
            value.length < 3 ||
            value.length > 254 ||
            !regex.hasMatch(value)) {
          return LanguageService().translate(
              frenchString: 'Le courriel n\'est pas valide',
              englishString: 'Email is not valid');
        }
        return null;
      },
      obscureText: false,
    );
  }

  @override
  Widget build(BuildContext context) {
    avatarSelector = AvatarSelector(onAvatarSelected: (avatar) {
      selectedAvatar = avatar;
    });
    validateButton = ElevatedButton(
      child: Text(
        LanguageService().translate(
            frenchString: 'S\'inscrire',
            englishString: 'Sign up'),
      ),
      onPressed: () async {
        if (_formKey.currentState != null &&
            _formKey.currentState!.validate()) {
          var res = await submitUser();
          print(res.statusCode);
          if (res.statusCode == 409) {
            usernameUnavailablePopup();
          } else if (res.statusCode == 201) {
            var body = jsonDecode(res.body);
            print(body);
            int defaultDinars = 1000;
            LoginService.loadUserInfo(
                pseudo.text, selectedAvatar, defaultDinars, [], body['id']);

            Navigator.pushReplacement(
                context, MaterialPageRoute(builder: (context) => MainPage()));
          }
        }
      },
    );

    passwordForm1 = ValidatedCustomTextField(
      controller: password,
      obscureText: true,
      labelText: LanguageService().translate(
          frenchString: 'Mot de passe :', englishString: 'Password :'),
      validator: (value) {
        RegExp regex = RegExp(r'^[a-zA-Z0-9]+$');
        if (value == null ||
            value.length < 5 ||
            value.length > 8 ||
            !regex.hasMatch(value)) {
          return LanguageService().translate(
              frenchString:
                  'Le mot de passe doit contenir seulement des lettres et des chiffres et contenir entre 5 et 8 caractères',
              englishString:
                  'Password must contain only letters and numbers and be between 5 and 8 characters long');
        }
        return null;
      },
    );
    passwordForm2 = ValidatedCustomTextField(
      obscureText: true,
      labelText: LanguageService().translate(
          frenchString: 'Confirmer le mot de passe :',
          englishString: 'Confirm password :'),
      validator: (value) {
        if (value != password.text) {
          return LanguageService().translate(
              frenchString: 'Les mots de passe ne correspondent pas',
              englishString: 'Passwords do not match');
        }
        return null;
      },
      controller: TextEditingController(),
    );
    double screenWidth = MediaQuery.of(context).size.width;

    return Scaffold(
      appBar: _appBar,
      body: Center(
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.2),
            borderRadius: BorderRadius.circular(10),
          ),
          padding: EdgeInsets.all(20),
          width: screenWidth * 0.4 > 200 ? screenWidth * 0.4 : 200,
          // height: MediaQuery.of(context).size.height * 0.8,
          child: Form(
            key: _formKey,
            child: ListView(
              shrinkWrap: true,
              children: [
                pseudoForm,
                emailForm,
                passwordForm1,
                passwordForm2,
                avatarSelector,
                validateButton,
              ],
            ),
          ),
        ),
      ),
    );
  }

// HTTP post to the server
  Future<http.Response> submitUser() async {
    String url = '${dotenv.env['SERVER_URL_AND_PORT']!}api/fs/players/new';
    print(url);
    final response = await http.post(
      Uri.parse(url),
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
      body: jsonEncode(<String, dynamic>{
        'username': pseudo.text,
        'password': password.text,
        'email': email.text,
        'channelsAndMuted': [],
        'avatar': selectedAvatar,
        'dinars': 1000,
        'boughtItems': [],
        'replays': [],
      }),
    );
    return response;
  }

  void usernameUnavailablePopup() {
    showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
            title: Text('⛔'),
            content: Text(LanguageService().translate(
                frenchString: 'Le pseudonyme ou le courriel est déjà utilisé.',
                englishString: 'Username or email already in use')),
            actions: <Widget>[
              TextButton(
                child: Text('OK'),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          );
        });
  }
}
