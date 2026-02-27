const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf-8');
const urlMatch = envFile.match(/EXPO_PUBLIC_SUPABASE_URL=(.+)/);
const keyMatch = envFile.match(/EXPO_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
if(urlMatch && keyMatch) {
  const supabase = createClient(urlMatch[1], keyMatch[1]);
  supabase.from('shop_items').select('*').then(({data}) => {
    console.log(JSON.stringify(data, null, 2));
  });
}
