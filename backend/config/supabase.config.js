const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes:');
  console.error('SUPABASE_URL:', supabaseUrl ? '✓ Défini' : '✗ Non défini');
  console.error('SUPABASE_ANON_KEY:', supabaseKey ? '✓ Défini' : '✗ Non défini');
  
  // En développement, on peut utiliser des valeurs par défaut (à retirer en production)
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  Mode développement - Utilisation de valeurs fictives');
    // Ne pas créer le client si les variables sont manquantes
    module.exports = null;
  } else {
    throw new Error('Variables Supabase manquantes - Vérifiez votre fichier .env');
  }
} else {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Client Supabase initialisé');
  module.exports = supabase;
}