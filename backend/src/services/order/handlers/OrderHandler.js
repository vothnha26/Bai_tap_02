class OrderHandler {
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }

  async handle(context) {
    if (this.nextHandler) {
      return await this.nextHandler.handle(context);
    }
    return context;
  }
}

module.exports = OrderHandler;
