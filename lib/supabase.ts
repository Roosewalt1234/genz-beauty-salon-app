import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cwimriwstwsiupzhiovs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3aW1yaXdzdHdzaXVwemhpb3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDY3OTMsImV4cCI6MjA4MDc4Mjc5M30.7z3t3Y_so_mzdhkxS3SzSfnCyWtLygQq6MHQ9u8aHaY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
