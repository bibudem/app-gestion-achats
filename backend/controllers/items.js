console.log('🎯 Chargement du contrôleur items...');

const supabase = require('../config/supabase.config');

// Vérifier Supabase
if (!supabase) {
  console.warn('⚠️ Supabase non configuré');
}

const itemsController = {
  postItems: async (req, res) => {
    try {
      console.log('➡️ POST /api/items/add');
      return res.json({ message: 'POST items/add - OK' });
    } catch (error) {
      console.error('Erreur POST:', error);
      return res.status(500).json({ error: error.message });
    }
  },

  putItems: async (req, res) => {
    try {
      console.log('➡️ PUT /api/items/save');
      return res.json({ message: 'PUT items/save - OK' });
    } catch (error) {
      console.error('Erreur PUT:', error);
      return res.status(500).json({ error: error.message });
    }
  },

  deleteItems: async (req, res) => {
    try {
      console.log('➡️ DELETE /api/items/delete/' + req.params.id);
      return res.json({ message: 'DELETE items/delete - OK' });
    } catch (error) {
      console.error('Erreur DELETE:', error);
      return res.status(500).json({ error: error.message });
    }
  },

  consulterItems: async (req, res) => {
    try {
      console.log('➡️ GET /api/items/fiche/' + req.params.id);
      return res.json({ message: 'GET items/fiche - OK' });
    } catch (error) {
      console.error('Erreur GET:', error);
      return res.status(500).json({ error: error.message });
    }
  }
};

console.log('✅ Contrôleur items initialisé avec succès');

module.exports = itemsController;