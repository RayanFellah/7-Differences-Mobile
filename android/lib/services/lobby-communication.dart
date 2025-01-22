class LobbyCommunicationService {
  String _playerName = '';

  void init(String playerName) {
    _playerName = playerName;
  }

  String getPlayerName() {
    return _playerName;
  }
}
