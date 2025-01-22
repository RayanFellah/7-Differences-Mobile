import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DeviceUnlock {
  static const platform = MethodChannel('com.example.polydiff/device_unlock');
  static const storage = FlutterSecureStorage();

  static Future<bool> unlockDevice() async {
    final bool isUnlocked = await platform.invokeMethod('unlockDevice');
    return isUnlocked;
  }

  static Future<Map<String, String>> getStoredCredentials() async {
    final String username = await storage.read(key: 'username') ?? '';
    final String password = await storage.read(key: 'password') ?? '';
    return {'username': username, 'password': password};
  }
}
