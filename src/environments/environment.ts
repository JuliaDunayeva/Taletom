export const environment = {
  production: false,

  // Supabase → Project Settings → API
  // В браузер кладём ТОЛЬКО public/publishable (anon) key.
  // Никогда не вставляй сюда service_role / secret key.
  supabaseUrl: 'PASTE_YOUR_SUPABASE_URL_HERE',
  supabaseAnonKey: 'PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY_HERE'
};
