class AdminError extends Error {
  constructor(statusCode, publicMessage) {
    super(publicMessage);
    this.name = 'AdminError';
    this.statusCode = statusCode;
    this.publicMessage = publicMessage;
  }
}

module.exports = AdminError;
