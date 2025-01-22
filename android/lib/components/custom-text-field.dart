import 'package:flutter/material.dart';

class CustomTextField extends StatelessWidget {
  final String labelText;
  final TextEditingController controller;
  final bool obscureText;
  final FormFieldValidator<String>? validator;

  CustomTextField({
    required this.controller,
    required this.labelText,
    required this.obscureText,
    this.validator
  });
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(labelText),
        SizedBox(height: 5,),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          decoration: InputDecoration(
            border: OutlineInputBorder(),
            contentPadding: EdgeInsets.all(10.0),
          ),
        ),
      SizedBox(height: 20),
      ],
    );
  }
}

class ValidatedCustomTextField extends StatefulWidget {
  final String labelText;
  final TextEditingController controller;
  final bool obscureText;
  final FormFieldValidator<String>? validator;

  ValidatedCustomTextField({
    required this.controller,
    required this.labelText,
    required this.obscureText,
    this.validator,
  });

  @override
  _ValidatedCustomTextFieldState createState() => _ValidatedCustomTextFieldState();
}

class _ValidatedCustomTextFieldState extends State<ValidatedCustomTextField> {
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      child: CustomTextField(
        controller: widget.controller,
        labelText: widget.labelText,
        obscureText: widget.obscureText,
        validator: widget.validator,
      ),
    );
  }
}