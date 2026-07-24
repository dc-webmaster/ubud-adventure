const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = envContent
  .split(/\r?\n/)
  .filter(Boolean)
  .reduce((acc, line) => {
    const idx = line.indexOf('=');
    if (idx >= 0) {
      acc[line.slice(0, idx)] = line.slice(idx + 1);
    }
    return acc;
  }, {});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
  auth: { persistSession: false },
  global: { fetch }
});

(async () => {
  try {
    const payload = {
      id: 1,
      whatsappNumber: '6281353046942',
      announcement: 'test announce',
      heroTitle: 'test title',
      heroSubtitle: 'test subtitle',
      prices: { 'Ayung River Rafting Only': 400000 }
    };

    const { data, error } = await supabase.from('content').upsert(payload).select().single();
    console.log('error', error);
    console.log('data', data);
  } catch (e) {
    console.error('exception', e);
  }
})();
