const { Client } = require('pg');

(async () => {
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  await client.query(`
ALTER TABLE public.trips ALTER COLUMN "Description" TYPE text USING "Description"::text;
ALTER TABLE public.trips ALTER COLUMN "Image" TYPE text USING "Image"::text;
ALTER TABLE public.trips ALTER COLUMN "HeaderImage" TYPE text USING "HeaderImage"::text;
ALTER TABLE public.trip_galleries ALTER COLUMN "ImageUrl" TYPE text USING "ImageUrl"::text;
ALTER TABLE public.vehicles ALTER COLUMN "CoverImage" TYPE text USING "CoverImage"::text;
ALTER TABLE public.hotels ALTER COLUMN "Image" TYPE text USING "Image"::text;
INSERT INTO public."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES
  ('20260806120000_ExpandImageColumnsToText', '9.0.0'),
  ('20260806130000_ExpandTripDescriptionToText', '9.0.0')
ON CONFLICT DO NOTHING;
`);
  const cols = await client.query(`
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_schema='public' AND table_name='trips'
  AND column_name IN ('Description','Image','HeaderImage')
ORDER BY column_name;
`);
  console.log(JSON.stringify(cols.rows, null, 2));
  await client.end();
})().catch((e) => {
  console.error('SQL_ERR', e.message);
  process.exit(1);
});
