#!/usr/bin/env node
/**
 * Swagger şemasından TypeScript tiplerini üretir.
 *
 * openapi-typescript'i doğrudan çağırmak yerine bu sarmalayıcı var, çünkü
 * ham hatalar okunaksız: API kapalıyken 40 satırlık bir undici yığın izi
 * basıyor ve asıl mesaj ("ECONNREFUSED") en altta kayboluyor. Şema
 * üretilemediğinde sorunun ne olduğu tek satırda anlaşılmalı.
 */
import { execFileSync } from 'node:child_process';

const baseUrl = (process.env.API_URL || 'http://localhost:5076').replace(/\/+$/, '');
const schemaUrl = `${baseUrl}/swagger/v1/swagger.json`;
const outFile = 'src/types/api.d.ts';

const die = (title, lines) => {
  console.error(`\n✖ ${title}\n`);
  for (const line of lines) console.error(`  ${line}`);
  console.error('');
  process.exit(1);
};

let response;
try {
  response = await fetch(schemaUrl);
} catch {
  die('API\'ye ulaşılamıyor.', [
    `Adres: ${schemaUrl}`,
    '',
    'API çalışmıyor olabilir. Başlatmak için:',
    '  cd turlagitsin-api/src/Api && dotnet run',
    '',
    'Farklı bir adres kullanıyorsanız:',
    '  API_URL=http://localhost:5000 npm run types:api',
  ]);
}

if (!response.ok) {
  const detail = response.status === 500
    ? [
        'API ayakta ama Swagger dökümanını üretemiyor.',
        'En sık sebep: iki DTO\'nun aynı kısa ada sahip olması.',
        'API konsolundaki istisnaya bakın — hangi tipin çakıştığını yazar.',
      ]
    : ['Beklenmeyen yanıt. Adresin doğru olduğunu kontrol edin.'];

  die(`Şema alınamadı (HTTP ${response.status}).`, [`Adres: ${schemaUrl}`, '', ...detail]);
}

try {
  execFileSync('npx', ['openapi-typescript', schemaUrl, '-o', outFile], { stdio: 'inherit' });
} catch {
  die('Tip üretimi başarısız oldu.', ['Yukarıdaki openapi-typescript çıktısına bakın.']);
}

console.log(`\n✔ ${outFile} güncellendi. Şimdi: npm run typecheck\n`);
