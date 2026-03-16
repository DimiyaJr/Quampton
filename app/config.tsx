const config = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

export default config;
