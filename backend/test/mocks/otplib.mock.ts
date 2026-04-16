module.exports = {
  authenticator: {
    generate: () => '123456',
    check: () => true,
    generateSecret: () => 'secret',
  }
};
