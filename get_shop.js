require('dotenv').config();
const url = process.env.EXPO_PUBLIC_SUPABASE_URL + '/rest/v1/shop_items?select=*';
fetch(url, {
  headers: {
    apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    Authorization: 'Bearer ' + process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  }
}).then(r => r.json()).then(console.log).catch(console.error);
