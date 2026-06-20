const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Fix: Node.js 20 does not have native WebSocket support.
// Polyfill global.WebSocket with the 'ws' package so that supabase-js works correctly.
if (!globalThis.WebSocket) {
  globalThis.WebSocket = require('ws');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = supabase;
