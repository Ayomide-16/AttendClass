import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mlpltajakxlmebplrhal.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scGx0YWpha3hsbWVicGxyaGFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTExODYsImV4cCI6MjA5MzQ2NzE4Nn0.bB1aaKWHKRJQKu6aIXW1K1mZSXKQmBLMnH24oVRgwKw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
