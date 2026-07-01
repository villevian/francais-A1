// Supabase project: french-a1-hub (eu-west-3)
// Publishable anon key — safe to expose in client-side code, access is scoped by RLS policies.
const SUPABASE_URL = "https://skdsvvtcbbzlbqtudbcg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrZHN2dnRjYmJ6bGJxdHVkYmNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5MTUxNzAsImV4cCI6MjA5ODQ5MTE3MH0.UW6IqX5CVfJsrBM18EPLlQOyfIP2kpBpdHy5k1c26Mw";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
