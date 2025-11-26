const Items = require('../models/items');
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
      //console.log(req.body);
      const cleaned = cleanEmptyFields(req.body);
      const result = await Items.create(cleaned);
      res.json(result);
    } catch (error) {
      console.error('Erreur POST:', error);
      return res.status(500).json({ error: error.message });
    }
  },

  putItems: async (req, res) => {
    try {
      console.log('➡️ PUT /api/items/save');
      console.log('ID reçu:', req.params.id);
      console.log('Données reçues:', req.body);
      const result = await Items.update(req.params.id, req.body);
      res.json(result);
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
      const result = await Items.findById(req.params.id);
      res.json(result);
    } catch (error) {
      console.error('Erreur GET:', error);
      return res.status(500).json({ error: error.message });
    }
  }
};

console.log('✅ Contrôleur items initialisé avec succès');

function cleanEmptyFields(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (v === "") return [k, null]; 
      return [k, v];
    })
  );
}

module.exports = itemsController;