/**
 * Üretilen API şemasına okunur takma adlar.
 *
 * api.d.ts Swagger'dan üretiliyor ve şema kimlikleri ad alanı ön ekiyle
 * geliyor (ResponseDto_UserResponseDto). Ön ek zorunlu: dört DTO adı iki
 * ayrı ad alanında tekrarlanıyor ve kısa adla üretim Swagger dökümanını
 * tümüyle bozuyordu.
 *
 * Bu dosya elle yazılıyor ama alan TANIMLAMIYOR — yalnızca üretilen tiplere
 * ad veriyor. Bir DTO .NET tarafında değişince buradaki takma ad da otomatik
 * değişir; kayma olmaz.
 *
 * api.d.ts'i yeniden üretmek için: npm run types:api
 */
import type { components, paths } from './api';

type Schemas = components['schemas'];

/* --- Kullanıcı / firma ------------------------------------------------- */
export type User = Schemas['ResponseDto_UserResponseDto'];
export type UpdateUserPayload = Schemas['User_UpdateUserDto'];
export type ChangePasswordPayload = Schemas['User_ChangePasswordDto'];

export type Company = Schemas['ResponseDto_CompanyResponseDto'];
export type UpdateCompanyPayload = Schemas['Company_UpdateCompanyDto'];

/* --- Banka / tahsilat -------------------------------------------------- */
export type CompanyBankInfo = Schemas['Company_CompanyBankInfoDto'];
export type BankChangeRequest = Schemas['Company_BankChangeRequestDto'];
export type CreateBankChangeRequestPayload = Schemas['Company_CreateBankChangeRequestDto'];

/* --- Turlar ------------------------------------------------------------ */
export type Trip = Schemas['ResponseDto_TripResponseDto'];
export type TripHotel = Schemas['ResponseDto_TripHotelDto'];
export type TripPricing = Schemas['ResponseDto_TripPricingDto'];
export type TripPolicy = Schemas['ResponseDto_TripPolicyDto'];
export type TripItinerary = Schemas['ResponseDto_TripItineraryDto'];

/* --- Rezervasyon / iade ------------------------------------------------ */
export type Reservation = Schemas['ResponseDto_ReservationResponseDto'];
export type CreateReservationPayload = Schemas['Reservation_CreateReservationDto'];
export type RefundRequest = Schemas['Refund_RefundRequestDto'];

/* --- Diğer ------------------------------------------------------------- */
export type Hotel = Schemas['Hotel_HotelDto'];
export type Coupon = Schemas['Coupon_CouponDto'];
export type Payment = Schemas['Payment_PaymentDto'];
export type Notification = Schemas['Notification_NotificationDto'];
export type GalleryImage = Schemas['Gallery_GalleryImageDto'];

/**
 * Bir ucun gövde ve yanıt tipini yol tanımından okur.
 *
 * Örnek:
 *   type Body = RequestBody<'/api/Users/{id}', 'put'>;
 *   type Res  = ResponseBody<'/api/Users/{id}', 'put'>;
 *
 * Şema takma adı yerine bunu kullanmak daha güvenli: ucun gerçekten hangi
 * DTO'yu beklediğini yol tanımından okur. Panelde tam da bu yüzden hata
 * çıkmıştı — PUT /api/Users/{id} UpdateUserDto değil UserProfileDto
 * bekliyordu ve fark derleme zamanında görünmüyordu.
 *
 * DİKKAT: Yol anahtarları PascalCase. [Route("api/[controller]")] denetleyici
 * sınıf adını olduğu gibi kullandığı için şemada "/api/Users/{id}" yazıyor.
 * Panelin kendisi "/api/users" diye çağırıyor ve ASP.NET yönlendirmesi harf
 * duyarsız olduğu için çalışıyor — ama bu tipler tam anahtarı bekler.
 */
export type RequestBody<
  P extends keyof paths,
  M extends keyof paths[P],
> = paths[P][M] extends { requestBody?: { content: { 'application/json': infer B } } } ? B : never;

export type ResponseBody<
  P extends keyof paths,
  M extends keyof paths[P],
> = paths[P][M] extends { responses: { 200: { content: { 'application/json': infer R } } } } ? R : never;
