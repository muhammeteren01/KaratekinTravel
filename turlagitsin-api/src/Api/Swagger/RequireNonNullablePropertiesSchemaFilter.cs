using System.Reflection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Api.Swagger
{
    /// <summary>
    /// Null olamayan referans tiplerini şemada "required" işaretler.
    ///
    /// SupportNonNullableReferenceTypes() yalnızca "null olabilir mi" bilgisini
    /// taşıyor; alanı zorunlu yapmıyor. Sonuçta panelin üretilen TypeScript
    /// tiplerinde her alan opsiyonel ("?") çıkıyor ve eksik zorunlu alan
    /// göndermek derleme hatası vermiyordu — tip üretmenin asıl amacı buydu.
    /// (PUT /api/Users/{id} zorunlu Email gönderilmediği için 400 dönüyordu.)
    ///
    /// Yalnızca referans tipleri işaretleniyor. C#'ta değer tipleri (int, bool,
    /// Guid, DateTime) zaten daima bir değere sahip; onları zorunlu saymak
    /// istemcide yapay katılık yaratır — panel createdAt göndermek zorunda
    /// kalırdı. Nullable reference types (Nullable enable) yalnızca referans
    /// tiplerinde gerçek bir niyet ifade ediyor.
    /// </summary>
    public class RequireNonNullablePropertiesSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (schema.Properties is null || schema.Properties.Count == 0) return;
            if (context.Type is null) return;

            // NullabilityInfoContext iş parçacığı güvenli değil; şema üretimi
            // paralel çalışabildiği için paylaşılan bir örnek tutulmuyor.
            var nullabilityContext = new NullabilityInfoContext();

            var clrProperties = context.Type.GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var entry in schema.Properties)
            {
                var clrProperty = clrProperties.FirstOrDefault(p =>
                    string.Equals(p.Name, entry.Key, StringComparison.OrdinalIgnoreCase));

                if (clrProperty is null) continue;

                // Değer tipleri atlanıyor; yalnızca referans tipleri değerlendiriliyor.
                if (clrProperty.PropertyType.IsValueType) continue;

                NullabilityInfo nullability;
                try
                {
                    nullability = nullabilityContext.Create(clrProperty);
                }
                catch
                {
                    // Nullability bilgisi okunamıyorsa alanı zorunlu yapma.
                    continue;
                }

                if (nullability.WriteState == NullabilityState.NotNull)
                {
                    schema.Required.Add(entry.Key);
                }
            }
        }
    }
}
