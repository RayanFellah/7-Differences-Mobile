import 'package:flutter/material.dart';

class Counter extends StatefulWidget {
  String name;
  int counter = 0;

  Counter({Key? key,required this.name, required this.counter});

  @override
  CounterState createState() => CounterState();
}

class CounterState extends State<Counter> {
  int count = 0;
  @override
  void initState() {
    super.initState();
  }

  void reset() {
    setState(() {
      count = 0;
    });
  }

  void increase() {
    setState(() {
      count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    print('Counter build for ${widget.name}');
    return Container(
      child: Column(
        children: [
          Text('Nom du joueur: ${widget.name}'),
          Text('Nombre de différences trouvés: ${widget.counter}'),
        ],
      ),
    );
  }
}
