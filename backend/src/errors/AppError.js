export default class AppError extends Error {
  constructor(mensagem, statusCode = 400, detalhes = null) {
    super(mensagem);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.detalhes = detalhes;
  }
}
