using Autofac;
using Autofac.Extensions.DependencyInjection;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Npgsql;
using Repository;
using Service.Validations;
using Core.Mappings;
using AutoMapper;

// Autofac DI kullanımı
var builder = WebApplication.CreateBuilder(args);

// Environment belirleme
var environment = builder.Environment.EnvironmentName;
Console.WriteLine($"🚀 Starting application in {environment} environment");

builder.Host.UseServiceProviderFactory(new AutofacServiceProviderFactory());
builder.Host.ConfigureContainer<ContainerBuilder>(containerBuilder =>
{
    containerBuilder.RegisterModule(new Api.Autofac.DependencyResolverModule());
});

// AutoMapper yapılandırması
builder.Services.AddAutoMapper(typeof(MapProfile));

// ***************************************************************
// 🔥 SUPABASE DATABASE CONFIGURATION (Free Tier optimized)
// ***************************************************************
// Free tier notları:
 // - Cold start yavaş olabilir → uzun Timeout
 // - Transaction pooler (6543) EF Core ile sorun çıkarır → Session (5432)
 // - EnableRetryOnFailure INSERT timeout sonrası aynı Id ile tekrar deneyip PK hatası verir → kapalı
 // - Bağlantı limiti düşük → küçük pool (MaxPoolSize=3)

string finalConnectionString;

static string BuildFreeTierConnectionString(string raw)
{
    NpgsqlConnectionStringBuilder csb;

    if (raw.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
        raw.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase))
    {
        var uri = new Uri(raw);
        var userInfo = uri.UserInfo.Split(':', 2);
        csb = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = string.IsNullOrWhiteSpace(uri.AbsolutePath.TrimStart('/'))
                ? "postgres"
                : uri.AbsolutePath.TrimStart('/'),
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : ""
        };
    }
    else
    {
        csb = new NpgsqlConnectionStringBuilder(raw);
    }

    // Yerel PostgreSQL kurulumlarında SSL genelde kapalıdır ve free-tier havuz
    // limitleri (MaxPoolSize=3) gereksiz yere kısıtlayıcıdır. Aşağıdaki Supabase
    // ayarlarını zorlamak yerel bağlantıyı doğrudan başarısız kılıyordu.
    var isLocal = csb.Host is "localhost" or "127.0.0.1" or "::1";

    if (isLocal)
    {
        csb.SslMode = SslMode.Disable;
        csb.Pooling = true;
        csb.MinPoolSize = 1;
        csb.MaxPoolSize = 20;
        csb.Timeout = 15;
        csb.CommandTimeout = 30;
        csb.ApplicationName = "turlagitsin-api";
        csb.IncludeErrorDetail = true;
        Console.WriteLine("💻 Yerel PostgreSQL tespit edildi — SSL kapalı, standart havuz ayarları");
        return csb.ToString();
    }

    // Transaction pooler (6543) → Session pooler (5432) — EF Core için zorunlu
    if (csb.Port == 6543)
    {
        Console.WriteLine("⚠️ Port 6543 (Transaction pooler) tespit edildi → 5432 (Session) kullanılıyor");
        csb.Port = 5432;
    }

    // Free tier Npgsql ayarları
    csb.SslMode = SslMode.Require;
    csb.TrustServerCertificate = true;
    csb.Timeout = 90;           // cold start
    csb.CommandTimeout = 90;
    csb.KeepAlive = 30;
    csb.Pooling = true;
    csb.MinPoolSize = 0;        // idle bağlantı tutma
    csb.MaxPoolSize = 3;        // free tier connection limiti
    csb.ConnectionIdleLifetime = 15;
    csb.ConnectionPruningInterval = 10;
    csb.NoResetOnClose = false;
    csb.ApplicationName = "turlagitsin-api";
    csb.IncludeErrorDetail = true;

    return csb.ToString();
}

var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrEmpty(databaseUrl))
{
    Console.WriteLine($"📦 Using DATABASE_URL from environment ({environment})");
    try
    {
        finalConnectionString = BuildFreeTierConnectionString(databaseUrl);
        var hostPreview = new NpgsqlConnectionStringBuilder(finalConnectionString);
        Console.WriteLine($"✅ Supabase free-tier connection ready: {hostPreview.Host}:{hostPreview.Port}");
    }
    catch (Exception ex)
    {
        throw new InvalidOperationException(
            $"Failed to parse DATABASE_URL. Error: {ex.Message}", ex);
    }
}
else
{
    Console.WriteLine("💻 DATABASE_URL not found, using appsettings.json");

    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    if (string.IsNullOrEmpty(connectionString))
    {
        throw new InvalidOperationException(
            "❌ DATABASE_URL environment variable or DefaultConnection in appsettings.json is required!\n" +
            "For Supabase setup, check: https://supabase.com/dashboard/project/_/settings/database");
    }

    finalConnectionString = BuildFreeTierConnectionString(connectionString);
    Console.WriteLine("⚠️ Using appsettings.json connection (free-tier settings applied)");
}

// Connection info logging
{
    var preview = new NpgsqlConnectionStringBuilder(finalConnectionString);
    Console.WriteLine("=== POSTGRESQL CONNECTION ===");
    Console.WriteLine($"Environment: {environment}");
    Console.WriteLine($"Host: {preview.Host}");
    Console.WriteLine($"Port: {preview.Port} (Supabase için 5432=Session önerilir)");
    Console.WriteLine($"Timeout: {preview.Timeout}s | CommandTimeout: {preview.CommandTimeout}s | MaxPool: {preview.MaxPoolSize}");
    Console.WriteLine("=====================================");
}

// DbContext (PostgreSQL) — free tier: NO automatic retry (prevents duplicate INSERT after timeout)
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(finalConnectionString, npgsqlOptions =>
    {
        npgsqlOptions.CommandTimeout(90);
        // EnableRetryOnFailure bilerek kapalı:
        // Free tier timeout sonrası aynı entity Id ile INSERT retry → PK_users hatası
    });

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

// ***************************************************************
// END DATABASE CONFIGURATION
// ***************************************************************

// CORS yapılandırması
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// JWT Authentication yapılandırması
var jwtKey = builder.Configuration["Jwt:Key"] ?? "YourSuperSecretKeyThatIsAtLeast32CharactersLong!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "TurlaGitsinAPI";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "TurlaGitsinApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Port yapılandırması
if (builder.Environment.IsProduction())
{
    // Render'ın PORT environment variable'ını kullan
    var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
    Console.WriteLine($"🌐 Production: Listening on port {port}");
}
else
{
    // Telefon / LAN erişimi için tüm arayüzlerden dinle
    builder.WebHost.UseUrls("http://0.0.0.0:5076");
    Console.WriteLine("🌐 Development: Listening on http://0.0.0.0:5076 (LAN erişilebilir)");
}

// Controller, Swagger ve diğer servisler
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Bitur API",
        Version = "v1",
        Description = $"Tour Management API - {environment}",
        Contact = new OpenApiContact
        {
            Name = "Bitur Team"
        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\""
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ***************************************************************
// 🔥 DATABASE MIGRATION
// ***************************************************************
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        logger.LogInformation("🔄 Warming up Supabase (free tier cold start)...");

        // Free tier: ilk bağlantı 30-60sn sürebilir — birkaç deneme
        var connected = false;
        for (var attempt = 1; attempt <= 5; attempt++)
        {
            try
            {
                connected = await context.Database.CanConnectAsync();
                if (connected) break;
            }
            catch (Exception warmEx)
            {
                logger.LogWarning(warmEx, "⏳ DB warm-up attempt {Attempt}/5 failed", attempt);
            }

            if (attempt < 5)
                await Task.Delay(TimeSpan.FromSeconds(3 * attempt));
        }

        if (!connected)
        {
            logger.LogError("❌ Cannot connect to database after warm-up retries!");
            throw new Exception("Database connection failed!");
        }

        logger.LogInformation("✅ Database connection successful");

        // Migration'ları uygula
        var pendingMigrations = await context.Database.GetPendingMigrationsAsync();
        if (pendingMigrations.Any())
        {
            logger.LogInformation($"📦 Found {pendingMigrations.Count()} pending migrations: {string.Join(", ", pendingMigrations)}");

            // Production'da ek güvenlik kontrolü
            if (builder.Environment.IsProduction())
            {
                var autoMigrate = Environment.GetEnvironmentVariable("AUTO_MIGRATE") ?? "true";
                if (autoMigrate.ToLower() == "false")
                {
                    logger.LogWarning("⚠️ AUTO_MIGRATE is disabled. Skipping migrations.");
                    logger.LogWarning("⚠️ Run migrations manually or set AUTO_MIGRATE=true");
                }
                else
                {
                    logger.LogInformation("🔄 Applying migrations in production...");
                    await context.Database.MigrateAsync();
                    logger.LogInformation("✅ Database migration completed successfully");
                }
            }
            else
            {
                await context.Database.MigrateAsync();
                logger.LogInformation("✅ Database migration completed successfully");
            }
        }
        else
        {
            logger.LogInformation("✅ Database is up to date, no migrations needed");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "❌ An error occurred while migrating the database");
        
        // Production'da migration hatası uygulamayı durdursun
        if (builder.Environment.IsProduction())
        {
            logger.LogCritical("🚨 Migration failed in production! Application cannot start.");
            throw;
        }
    }
}

// ***************************************************************
// MIDDLEWARE CONFIGURATION
// ***************************************************************

// Swagger yapılandırması
if (app.Environment.IsDevelopment())
{
    // Development'ta Swagger UI root'ta
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bitur API v1");
        c.RoutePrefix = string.Empty;
        c.DocumentTitle = "Bitur API - Development";
    });
}
else
{
    // Production'da Swagger /swagger altında
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Bitur API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "Bitur API - Production";
    });
}

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

// HTTPS redirect sadece production'da ve gerekiyorsa
if (app.Environment.IsProduction())
{
    // Render otomatik HTTPS yönlendirme yapıyor
    Console.WriteLine("ℹ️ HTTPS redirect disabled (Render handles this)");
}

app.MapControllers();

// ***************************************************************
// HEALTH CHECK & ENDPOINTS
// ***************************************************************

// Health check endpoint (Render için kritik)
app.MapGet("/health", () => Results.Ok(new 
{ 
    status = "healthy", 
    environment = environment,
    timestamp = DateTime.UtcNow,
    version = "1.0.0"
}))
.WithName("HealthCheck")
.WithOpenApi()
.AllowAnonymous();

// Weather forecast endpoint (test için)
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm",
    "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

Console.WriteLine($"✅ Bitur API started successfully in {environment} mode");
Console.WriteLine($"📍 Swagger UI: {(app.Environment.IsDevelopment() ? "/" : "/swagger")}");
app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}