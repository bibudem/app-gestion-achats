const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase.config');

console.log('🛣️ Initialisation des routes items...');

// Import du contrôleur avec gestion d'erreur
let itemsController;
try {
  itemsController = require('../controllers/items');
  console.log('✅ Contrôleur items chargé');
} catch (error) {
  console.error('❌ Erreur chargement contrôleur:', error.message);
  // Créer un contrôleur de secours
  itemsController = {
    postItems: (req, res) => res.status(500).json({ error: 'Contrôleur non disponible' }),
    putItems: (req, res) => res.status(500).json({ error: 'Contrôleur non disponible' }),
    deleteItems: (req, res) => res.status(500).json({ error: 'Contrôleur non disponible' }),
    consulterItems: (req, res) => res.status(500).json({ error: 'Contrôleur non disponible' })
  };
}

// Vérifier que le contrôleur a les méthodes nécessaires
const requiredMethods = ['postItems', 'putItems', 'deleteItems', 'consulterItems'];
requiredMethods.forEach(method => {
  if (typeof itemsController[method] !== 'function') {
    console.error(`❌ Méthode manquante: ${method}`);
    itemsController[method] = (req, res) => res.status(500).json({ error: `Méthode ${method} non implémentée` });
  }
});

// Définir les routes
router.post('/add', itemsController.postItems);
router.put('/save/:id', itemsController.putItems);
router.delete('/delete/:id', itemsController.deleteItems);
router.get('/fiche/:id', itemsController.consulterItems);

// Nouvelles routes pour la liste
router.get('/all', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tbl_items')
      .select('*')
      .order('date_creation', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erreur GET /all:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const { data, error } = await supabase
      .from('tbl_items')
      .select('*')
      .or(`titre_document.ilike.%${q}%,auteur.ilike.%${q}%,isbn_issn.ilike.%${q}%`)
      .order('date_creation', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erreur GET /search:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { data, error } = await supabase
      .from('tbl_items')
      .select('*')
      .eq('type_formulaire', type)
      .order('date_creation', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erreur GET /type:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const { data, error } = await supabase
      .from('tbl_items')
      .select('*')
      .eq('bib_statut_demande', status)
      .order('date_creation', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Erreur GET /status:', error);
    res.status(500).json({ error: error.message });
  }
});

console.log('✅ Routes items configurées avec succès');

module.exports = router;