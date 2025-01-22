import 'dart:convert';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;

class HttpRequestTool {
  static String prefix = dotenv.env['SERVER_URL_AND_PORT']!;

  static Future<http.Response> basicGet(String url) {
    String completeUrl = '$prefix$url';
    return http.get(
      Uri.parse(completeUrl),
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
    );
  }

  static Future<http.Response> basicPut(String url, Map<String, dynamic> body) {
    String completeUrl = '$prefix$url';
    print(completeUrl);
    return http.put(
      Uri.parse(completeUrl),
      headers: <String, String>{
        'Content-Type': 'application/json',
      },
      body: json.encode(body),
    );
  }

    static Future<http.Response> basicPatch(String url, Map<String, dynamic> body) {
      String completeUrl = '$prefix$url';
      print(completeUrl);
      return http.patch(
        Uri.parse(completeUrl),
        headers: <String, String>{
          'Content-Type': 'application/json',
        },
        body: json.encode(body),
      );
  }
}
