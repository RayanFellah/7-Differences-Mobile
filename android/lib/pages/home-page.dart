import 'package:flutter/material.dart';
import 'package:polydiff/components/login-fields.dart';

class HomePage extends StatelessWidget {
  final String appName = 'PolyDiff';

  @override
  Widget build(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    double screenHeight = MediaQuery.of(context).size.height;

    Row appTitleDisplay = Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Image.asset(
          'assets/images/logo1.png',
          height: screenHeight * 0.2,
        ),
        SizedBox(width: 50),
        Text(
          appName,
          style: TextStyle(fontSize: 64, color: Colors.white),
        ),
      ],
    );

    Container loginFields = Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2), 
        borderRadius: BorderRadius.circular(10), 
      ),
      padding: EdgeInsets.all(20),
      child: LoginFields(),
    );

    return PopScope(
      canPop: false, // Prevents the user from navigating back
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: SizedBox(
            width: screenWidth * 0.4 > 200 ? screenWidth * 0.4 : 200,
            child: ListView(
              shrinkWrap: true,
              children: [
                appTitleDisplay,
                SizedBox(height: 20),
                loginFields,
              ],
            ),
          ),
        ),
      ),
    );
  }
}
