# API tipleri

`api.d.ts` **elle yazılmaz** — .NET API'nin Swagger şemasından üretilir.

## Neden üretiliyor, elle yazılmıyor?

Panel ile API arasındaki sözleşme kayması bu projede gerçekten hataya yol açtı:

- `PUT /api/users/{id}` **400** dönüyordu: API `Email` alanını zorunlu sayıyordu,
  panel göndermiyordu. Ekranda "kaydediliyor" görünüp hiçbir şey kaydedilmiyordu.
- Otel seçiminde `hotelId` gönderiliyordu; `TripHotelInputDto`'da karşılığı olmadığı
  için API sessizce yok sayıyordu.
- Ayarlar formundaki `website` ve `taxNo` alanları doldurulup kayboluyordu.

Elle yazılan bir `interface` bunların hiçbirini yakalamaz: kaynak .NET tarafında,
ayna kopya panelde. İkisi bağımsız olduğu için ayna bir gün sonra yalan söylemeye
başlar — üstelik artık derleyici onayıyla.

Üretilen tiplerde .NET tarafında bir alan değişince panel **derlenmez**.

## Kullanım

API çalışırken:

```
npm run types:api
```

Farklı bir adres için:

```
API_URL=http://localhost:5000 npm run types:api
```

Sonra:

```
npm run typecheck
```

## Üretilen dosya depoya girer

`src/types/api.d.ts` **commit edilir**. Sebepleri:

- Panelin derlenmesi için .NET API'nin ayakta olması gerekmez.
- CI, veritabanı ve API başlatmadan tip kontrolü yapabilir.
- API sözleşmesi değiştiğinde bunu PR diff'inde görürsünüz. Bu bir yan etki değil,
  istenen davranış: sözleşme değişikliği gözden kaçmaz.

Şema değiştiğinde `npm run types:api` çalıştırıp çıkan diff'i commit'e dahil edin.

## Bilinen tuzak

`typescript` paketi **5.x'e sabitlenmiştir**. TypeScript 7 (Go tabanlı yeni sürüm)
`ts.factory` API'sini değiştirdi ve `openapi-typescript` ile çalışmıyor:

```
TypeError: Cannot read properties of undefined (reading 'createKeywordTypeNode')
```

`typescript`'i major sürüm atlatmadan önce `openapi-typescript` uyumluluğunu kontrol edin.
