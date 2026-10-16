import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://untelfsvvoavrkwisfbm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudGVsZnN2dm9hdnJrd2lzZmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDYwOTksImV4cCI6MjA2NzgyMjA5OX0.Lal7pmr01KlZ_hsuUEmtHJd4oYQdiZeUTH3dhFxC9yc';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
