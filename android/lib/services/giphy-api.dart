import 'dart:convert';

import 'package:http/http.dart' as http;

class GiphyAPI {
  final String apiKey = '0kABNWPQuSJRf6hDCO0h7Jo4A8VeO2Bb';

   Future<List<String>> fetchTrendingGifs() async {
    final url = 'https://api.giphy.com/v1/gifs/trending?api_key=$apiKey&limit=20';
    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List gifs = data['data'];
      return gifs.map<String>((gif) => gif['images']['fixed_height']['url']).toList();
    } else {
      throw Exception('Failed to load gifs');
    }
  }

  Future<List<String>> fetchGifs(String query) async {
    final url = 'https://api.giphy.com/v1/gifs/search?api_key=$apiKey&q=$query&limit=20';
    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final List gifs = data['data'];
      return gifs.map<String>((gif) => gif['images']['fixed_height']['url']).toList();
    } else {
      throw Exception('Failed to load gifs');
    }
  }
}
