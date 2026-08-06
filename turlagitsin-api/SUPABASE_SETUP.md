# 🚀 Supabase Kurulum Rehberi

Bu proje **Supabase** kullanıyor. Hem development hem production için Supabase ücretsiz tier'ını kullanıyoruz.

**Repository:** https://github.com/muhammeteren01/turlagitsin-api

---

## 📊 Supabase Ücretsiz Tier (Free Plan)

✅ **5000+ kullanıcıyı destekler!**

- 500MB veritabanı
- Sınırsız API çağrıları
- 50,000 aylık aktif kullanıcı (authentication)
- Otomatik backup (7 günlük)
- SSL/TLS şifreleme
- 2GB dosya depolama
- 1GB bandwidth

**Maliyet:** Tamamen ücretsiz! Kredi kartı gerekmez.

### Free tier ile EF Core ayarları (bu projede otomatik)

| Ayar | Değer | Neden |
|------|-------|--------|
| Port | **5432 Session pooler** | 6543 Transaction pooler EF ile timeout/PK hatası verir |
| Timeout | 90 sn | Cold start (uyuyan DB) için |
| MaxPoolSize | 3 | Free connection limiti |
| MinPoolSize | 0 | Idle bağlantı tutma |
| EnableRetryOnFailure | Kapalı | Timeout sonrası aynı INSERT retry → `PK_users` hatası |

Dashboard → **Settings → Database → Connection string → Method: Session pooler** kullan.
Region mümkünse Avrupa (`eu-central-1`); `ap-northeast-1` Türkiye'den daha yavaş olabilir.

---

## 🎯 Adım 1: Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) sitesine git
2. **Start your project** butonuna tıkla
3. GitHub ile giriş yap
4. **New Project** oluştur:
   - **Organization:** Kendi organizasyonunu seç veya yeni oluştur
   - **Name:** `turlagitsin-api` (veya istediğin isim)
   - **Database Password:** Güçlü bir şifre belirle (**bunu kaydet!**)
   - **Region:** `Frankfurt (eu-central-1)` (Avrupa için önerilen)
   - **Pricing Plan:** Free (varsayılan)
5. **Create new project** butonuna tıkla
6. 1-2 dakika bekle, proje hazırlanıyor...

---

## 🔑 Adım 2: Connection String'i Alma

Proje hazır olduğunda:

1. Sol menüden **Settings** > **Database** bölümüne git
2. **Connection String** sekmesine tıkla
3. **URI** formatını seç (PostgreSQL URI)
4. Connection string şu formatta olacak:

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

5. `[YOUR-PASSWORD]` kısmını, proje oluştururken belirlediğin şifre ile değiştir

**Örnek:**
```
postgresql://postgres.abcdefghijk:MySecurePassword123!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

---

## 💻 Adım 3: Development Ortamı (Yerel Bilgisayar)

### Yöntem 1: Environment Variable (Önerilen)

Windows PowerShell'de:
```powershell
$env:DATABASE_URL = "postgresql://postgres.abcdefghijk:MySecurePassword123!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
```

Kalıcı olarak ayarlamak için (Windows):
```powershell
[System.Environment]::SetEnvironmentVariable('DATABASE_URL', 'postgresql://postgres.abcdefghijk:MySecurePassword123!@...', 'User')
```

### Yöntem 2: appsettings.Development.json

`src/Api/appsettings.Development.json` dosyasını düzenle:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "postgresql://postgres.abcdefghijk:MySecurePassword123!@aws-0-eu-central-1.pooler.supabase.com:5432/postgres"
  }
}
```

**⚠️ Dikkat:** Bu dosyayı Git'e commit etme! `.gitignore` dosyasına eklenmiş olmalı.

---

## 🌐 Adım 4: Production Ortamı (Deployment)

**Not:** Bu proje CI/CD pipeline'ı içermemektedir. Deployment manuel olarak yapılır.

### Deployment platformunda (örn: Azure, AWS, IIS):

1. Projeyi production için build et:
   ```powershell
   dotnet publish -c Release -o ./publish
   ```

2. Environment variable'ı ayarla:
   - **Key:** `DATABASE_URL`
   - **Value:** Supabase connection string'ini yapıştır

3. Sunucuda uygulamayı çalıştır:
   ```powershell
   cd publish
   dotnet Api.dll
   ```

**CI/CD eklemek isterseniz:** GitHub Actions, Azure DevOps veya GitLab CI/CD kullanabilirsiniz.

---

## ✅ Adım 5: Migration ve Test

### Migration çalıştırma

Proje otomatik olarak migration yapıyor, ancak manuel çalıştırmak isterseniz:

```powershell
cd src/Api
dotnet ef database update
```

### Uygulamayı çalıştırma

```powershell
cd src/Api
dotnet run
```

Çıktıda şunu görmelisiniz:
```
🚀 Starting application in Development environment
✅ Successfully connected to Supabase: aws-0-eu-central-1.pooler.supabase.com
🔄 Starting database migration...
✅ Database migration completed successfully
```

### Test endpoint'i

Tarayıcıdan veya Postman'den:
```
http://localhost:5000/health
```

Cevap:
```json
{
  "status": "healthy",
  "environment": "Development",
  "timestamp": "2026-02-23T10:30:00Z",
  "version": "1.0.0"
}
```

---

## 🔍 Supabase Dashboard'da Tablolarınızı Görüntüleme

1. Supabase Dashboard > **Table Editor** sekmesine git
2. Migration sonrası oluşan tüm tablolarınızı görebilirsiniz:
   - `Users`
   - `Trips`
   - `Reservations`
   - `Companies`
   - vb.

---

## 🛠️ Faydalı Komutlar

### Yeni migration oluşturma

```powershell
cd src/Repository
dotnet ef migrations add MigrationName --startup-project ../Api
```

### Migration'ları listeleme

```powershell
cd src/Api
dotnet ef migrations list
```

### Son migration'ı geri alma

```powershell
cd src/Api
dotnet ef migrations remove
```

---

## 🔐 Güvenlik Önerileri

1. **DATABASE_URL'i asla Git'e commit etme**
   - `appsettings.Development.json` `.gitignore` da olmalı
   - Sadece environment variable kullan

2. **Güçlü şifre kullan**
   - En az 16 karakter
   - Büyük/küçük harf, sayı, özel karakter

3. **Row Level Security (RLS) aktifleştir**
   - Supabase Dashboard > Authentication > Policies
   - Tablolarınıza erişim kuralları ekleyin

4. **JWT Secret'ları koruyun**
   - `JWT_KEY` environment variable'ını güvenli bir şekilde ayarlayın
   - Production'da mutlaka environment variable kullanın

---

## 📱 Monitoring ve Performans

### Supabase Dashboard'dan izleme:

1. **Database** > **Database Health**: CPU, RAM, disk kullanımı
2. **Logs**: Sorgu logları, hata logları
3. **Reports**: Bağlantı sayısı, sorgu performansı

### Performans optimizasyonu:

- **Pooling aktif**: Connection pool max 20 (production), 5 (dev)
- **Indexler**: Migration'larda gerekli indexleri ekleyin
- **Vakuuming**: Supabase otomatik yapıyor

---

## 🆘 Sorun Giderme

### Hata: "Cannot connect to database"

1. Connection string'i kontrol et
2. Supabase şifresinin doğru olduğundan emin ol
3. Supabase projesinin aktif olduğunu kontrol et

### Hata: "SSL connection required"

Program.cs'de `SslMode = SslMode.Require` zaten ayarlı. Eğer sorun devam ediyorsa:

```csharp
SslMode = SslMode.VerifyFull
```

### Hata: "Too many connections"

Free tier'da maksimum 60 bağlantı var. Connection pool ayarlarını azaltın:
- Production: `MaxPoolSize = 10`
- Development: `MaxPoolSize = 3`

---

## 💰 Maliyet Karşılaştırması

| Servis | Free Tier | 5000 Kullanıcı Desteği | Limit |
|--------|-----------|------------------------|-------|
| **Supabase** | ✅ Ücretsiz | ✅ Evet | 500MB DB, 50k auth/ay |
| PlanetScale | ✅ Ücretsiz | ✅ Evet | 5GB, 1B satır/ay |
| Azure SQL | ✅ Ücretsiz | ⚠️ Karmaşık | 100k vCore sn/ay |
| AWS RDS | ❌ Ücretli | - | $15+/ay |

**Supabase önerilir:** Tamamen ücretsiz, kolay kurulum, güçlü özellikler

---

## 🎓 Ek Kaynaklar

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)

---

## 🚀 Deployment

### GitHub Repository
```bash
git clone https://github.com/muhammeteren01/turlagitsin-api.git
cd turlagitsin-api
```

### Development için Çalıştırma

```bash
cd src/Api
dotnet restore
dotnet run
```

### Production için Build ve Deploy

```bash
# Build
dotnet publish -c Release -o ./publish

# Environment variable ayarla (Windows)
$env:DATABASE_URL = "your-supabase-connection-string"

# Çalıştır
cd publish
dotnet Api.dll
```

**Not:** CI/CD pipeline henüz eklenmemiştir. İsteğe göre GitHub Actions, Azure DevOps veya GitLab CI/CD ekleyebilirsiniz.

---

**İyi çalışmalar! 🚀**
