import 'package:camera/camera.dart';

class Camera {
  static late List<CameraDescription> cameras;
  static late CameraDescription camera;

  static Future<void> initialize() async {
    cameras = await availableCameras();
    // Front Camera
    camera = cameras.last;
  }
}
