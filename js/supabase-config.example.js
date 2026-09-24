/**
 * TALFE ARQUITETURA - Supabase Client Configuration (Template)
 * Copie este arquivo para `supabase-config.js` e insira suas credenciais.
 * ⚠️ ATENÇÃO: Use apenas a chave anon/public aqui (nunca a service_role key).
 */

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
