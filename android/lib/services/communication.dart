import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

import 'game-card-template.dart';
import 'game-classes.dart';

class CommunicationService {
  final String baseUrl = '${dotenv.env['SERVER_URL_AND_PORT']}api';
  final String fileSystem = 'fs';

  CommunicationService() {
    print('CommunicationService constructor');
  }

  Future<http.Response> uploadImage(String img) {
    return http.post(
      Uri.parse('$baseUrl/$fileSystem/image'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'img': img}),
    );
  }

  Future<http.Response> downloadImage(String id) {
    return http.get(Uri.parse('$baseUrl/$fileSystem/image?id=$id'));
  }

  Future<http.Response> uploadGameCard(GameCardTemplate gameCard) {
    return http.post(
      Uri.parse('$baseUrl/$fileSystem/gameCard'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'gameCard': gameCard}),
    );
  }

  Future<List<GameCardTemplate>> downloadGameCards() async {
    print('Fetching the game cards...');
    final response =
        await http.get(Uri.parse('$baseUrl/$fileSystem/gameCards'));

    if (response.statusCode == 200) {
      List<GameCardTemplate> gameCards = parseGameCards(response.body);
      print('${gameCards.length} game cards fetched');
      print(gameCards);
      return gameCards;
    } else {
      throw Exception('Failed to load game cards');
    }
  }

  Future<GameCardTemplate> downloadGameCard(String id) async {
    final response =
        await http.get(Uri.parse('$baseUrl/$fileSystem/gameCard?id=$id'));

    if (response.statusCode == 200) {
      return GameCardTemplate.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to load game card');
    }
  }

  List<GameCardTemplate> parseGameCards(String responseBody) {
    final parsed = json.decode(responseBody).cast<Map<String, dynamic>>();
    return parsed
        .map<GameCardTemplate>((json) => GameCardTemplate.fromJson(json))
        .toList();
  }

  Future<http.Response> deleteGameCard(String id) {
    return http.delete(Uri.parse('$baseUrl/$fileSystem/gameCard?id=$id'));
  }

  Future<http.Response> deleteAllCards() {
    return http.delete(Uri.parse('$baseUrl/$fileSystem/gameCards'));
  }

  Future<http.Response> addGameToHistory(GameEnded gameEnded) {
    return http.post(
      Uri.parse('$baseUrl/$fileSystem/gameEnded'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'gameEnded': gameEnded}),
    );
  }

  Future<http.Response> getHistory() {
    return http.get(Uri.parse('$baseUrl/$fileSystem/history'));
  }

  Future<http.Response> deleteHistory() {
    return http.delete(Uri.parse('$baseUrl/$fileSystem/history'));
  }

  Future<http.Response> setNewTime(NewTime newTime) {
    return http.post(
      Uri.parse('$baseUrl/$fileSystem/newTime'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'newTime': newTime}),
    );
  }

  Future<http.Response> getBestTimes(String gameCardId) {
    return http.get(
        Uri.parse('$baseUrl/$fileSystem/bestTimes?gameCardId=$gameCardId'));
  }

  Future<http.Response> resetBestTimes(String gameCardId) {
    return http.delete(
      Uri.parse('$baseUrl/$fileSystem/bestTimes?gameCardId=$gameCardId'),
      headers: {'Content-Type': 'application/json'},
    );
  }

  Future<http.Response> resetAllBestTimes() {
    return http.delete(Uri.parse('$baseUrl/$fileSystem/bestTimes/all'),
        headers: {'Content-Type': 'application/json'});
  }

  Future<http.Response> getConstants() {
    return http.get(Uri.parse('$baseUrl/$fileSystem/constants'));
  }

  Future<http.Response> setConstants(Constants constants) {
    return http.post(Uri.parse('$baseUrl/$fileSystem/constants'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'constants': constants}));
  }

  Future<http.Response> getGameConstants() {
    return http.get(Uri.parse('$baseUrl/$fileSystem/constants'));
  }
}
