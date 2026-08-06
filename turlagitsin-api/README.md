# Tur Rezervasyon API Projesi

Bu proje, tur şirketlerinin turlarını oluşturup kullanıcıların bu turlardan yer ayırtmasını sağlayan bir mobil uygulama backend API projesidir. Proje **N-Layer mimarisi** kullanılarak geliştirilmiştir.

## Proje Katmanları

Projede toplamda 4 katman bulunmaktadır:

### 1. Core
- En iç katman.
- Tüm diğer katmanlar tarafından kullanılacak **interface'ler**, **entity'ler**, **DTO'lar**, **enumlar** ve **ortak kütüphaneler** burada bulunur.
- Service ve Repository katmanlarında kullanılacak interface'ler ayrı klasörlerde organize edilmiştir.

### 2. Repository
- Veritabanı işlemlerinden sorumludur.
- İçerik:
  - Entity Framework ile **DbContext**, **Migration** dosyaları ve **seed data**
  - Entity configuration'lar
  - Unit of Work pattern implementasyonu
  - Core katmanındaki interface'leri kullanarak CRUD işlemlerini gerçekleştirir

### 3. Service
- İş katmanıdır.
- Repository’den gelen verileri işleyip API’nin ihtiyacı olan formata çevirir.
- İçerik:
  - CRUD işlemleri ve iş kuralları
  - Mapping (AutoMapper)
  - Validation (Fluent Validation)
  - Exception handling

### 4. API
- En dış katman, mobil uygulamanın veri alacağı HTTP endpoint'lerini sağlar.
- İçerik:
  - Controller'lar
  - Middleware ve Filters
  - Dependency Injection konfigürasyonu (Autofac vb.)
  - Service katmanına istek atarak veriyi mobil uygulamaya sunar

---

## Teknolojiler ve Araçlar

- .NET 9
- PostgreSQL (veritabanı)
- Entity Framework Core
- AutoMapper, Fluent Validation
- Dependency Injection: Autofac
- CI/CD: Render

---

## Geliştirici Talimatları

1. Projeyi klonlayın ve **test branch**’inde çalışın:
   ```bash
   git checkout test
