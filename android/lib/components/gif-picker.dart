import 'package:flutter/material.dart';
import 'package:polydiff/services/giphy-api.dart';

class GifPicker extends StatefulWidget {
  @override
  _GifPickerState createState() => _GifPickerState();
}

class _GifPickerState extends State<GifPicker> {
  List<String> _gifUrls = [];
  final _searchController = TextEditingController();

   @override
  void initState() {
    super.initState();
    _loadInitialGifs();
  }

  void _loadInitialGifs() async {
    final gifs = await GiphyAPI().fetchTrendingGifs(); // Récupère les GIFs tendances
    setState(() {
      _gifUrls = gifs;
    });
  }

  void _searchGifs() async {
    final gifs = await GiphyAPI().fetchGifs(_searchController.text);
    setState(() {
      _gifUrls = gifs;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: TextField(
            controller: _searchController,
            decoration: InputDecoration(
              labelText: 'Search for a GIF',
              suffixIcon: IconButton(
                icon: Icon(Icons.search),
                onPressed: _searchGifs,
              ),
            ),
            onSubmitted: (value) => _searchGifs(), 
          ),
        ),
        Expanded(
          child: GridView.builder(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2),
            itemCount: _gifUrls.length,
            itemBuilder: (context, index) {
              return InkWell(
                onTap: () {
                  Navigator.pop(context, _gifUrls[index]);
                },
                child: Image.network(_gifUrls[index], fit: BoxFit.cover),
              );
            },
          ),
        ),
      ],
    );
  }
}