const makeWASocket = jest.fn().mockReturnValue({
  ev: {
    on: jest.fn(),
  },
  sendMessage: jest.fn(),
  logout: jest.fn(),
});

module.exports = makeWASocket;
module.exports.useMultiFileAuthState = jest.fn().mockResolvedValue({
  state: {},
  saveCreds: jest.fn(),
});
module.exports.DisconnectReason = {
  loggedOut: 401,
};
module.exports.fetchLatestBaileysVersion = jest.fn().mockResolvedValue({ version: [2, 2300, 1] });
