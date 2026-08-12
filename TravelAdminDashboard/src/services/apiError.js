/**
 * Ayrı modülde: hem gerçek HTTP katmanı hem demo sunucusu bu sınıfı kullanıyor,
 * adminApi <-> demoServer arasında dairesel import olmasın diye burada duruyor.
 */
export class ApiError extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}
