# Supabase Setup for Bali Adventure

## 1. Buat table `content`

Jalankan SQL berikut di Supabase SQL Editor:

```sql
create table if not exists content (
  id integer primary key,
  whatsappNumber text not null,
  announcement text not null,
  heroTitle text not null,
  heroSubtitle text not null,
  prices jsonb not null
);

insert into content (id, whatsappNumber, announcement, heroTitle, heroSubtitle, prices)
values (
  1,
  '6281353046942',
  'Special Rates! Choose Standalone Activities or Save Big with Combo Packages!',
  'Choose Single Activities or The Ultimate Combo Adventure!',
  'Looking for wild river rafting or an exhilarating off-road quad bike track? Book individual activities or join both in a full-day adventure combo through Ubud''s jungles, waterfalls, and caves.',
  '{"Ayung River Rafting Only":400000,"Single ATV Ride Only":650000,"Tandem ATV Ride Only":950000,"Rafting + Single ATV Combo":1100000,"Rafting + Tandem ATV Combo":1800000}'::jsonb
)
on conflict (id) do update set
  whatsappNumber = excluded.whatsappNumber,
  announcement = excluded.announcement,
  heroTitle = excluded.heroTitle,
  heroSubtitle = excluded.heroSubtitle,
  prices = excluded.prices;
```

## 2. Set environment variables

Di lokal, buat file `.env.local`:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-service-role-or-anon-key
```

Di Vercel, tambahkan setting environment variables dengan nama yang sama.

## 3. Testing

Setelah deploy, login admin dengan query string `?admin=true` atau `?secret=1234`, lalu coba simpan perubahan.

Jika terjadi error, cek log Vercel dan pastikan:
- `SUPABASE_URL` benar
- `SUPABASE_KEY` memiliki akses ke table `content`
- table `content` sudah berisi row `id = 1`
