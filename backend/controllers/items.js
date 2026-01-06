const Items = require('../models/items');
console.log('🎯 Chargement du contrôleur items...');

const itemsController = {
  // ==================== CREATE ====================
  postItems: async (req, res) => {
    try {
      console.log('➡️ POST /api/items/add');
      console.log('Données reçues:', req.body);
      
      // Nettoyer les champs vides
      const cleaned = cleanEmptyFields(req.body);
      
      // Créer l'item dans la base de données
      const result = await Items.create(cleaned);
      
      console.log('✅ Item créé avec succès:', result[0]?.id_item);
      res.status(201).json({
        success: true,
        message: 'Item créé avec succès',
        data: result[0]
      });
    } catch (error) {
      console.error('❌ Erreur POST:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // ==================== READ ONE ====================
  consulterItems: async (req, res) => {
    try {
      console.log('➡️ GET /api/items/fiche/' + req.params.id);
      
      const result = await Items.findById(req.params.id);
      
      console.log('✅ Item récupéré avec succès');
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('❌ Erreur GET:', error);
      
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ 
          success: false,
          error: 'Item non trouvé' 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    }
  },

  // ==================== UPDATE ====================
  putItems: async (req, res) => {
    try {
      console.log('➡️ PUT /api/items/save/' + req.params.id);
      console.log('Données reçues:', req.body);
      
      // Nettoyer les champs vides
      const cleaned = cleanEmptyFields(req.body);
      
      // Mettre à jour l'item
      const result = await Items.update(req.params.id, cleaned);
      
      console.log('✅ Item mis à jour avec succès');
      res.json({
        success: true,
        message: 'Item mis à jour avec succès',
        data: result[0]
      });
    } catch (error) {
      console.error('❌ Erreur PUT:', error);
      
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ 
          success: false,
          error: 'Item non trouvé pour la mise à jour' 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    }
  },

  // ==================== DELETE ====================
  deleteItems: async (req, res) => {
    try {
      console.log('➡️ DELETE /api/items/delete/' + req.params.id);
      
      const result = await Items.delete(req.params.id);
      
      console.log('✅ Item supprimé avec succès');
      res.json({
        success: true,
        message: 'Item supprimé avec succès',
        data: result[0]
      });
    } catch (error) {
      console.error('❌ Erreur DELETE:', error);
      
      if (error.message.includes('non trouvé')) {
        res.status(404).json({ 
          success: false,
          error: 'Item non trouvé pour la suppression' 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: error.message 
        });
      }
    }
  },

  // ==================== READ ALL + PAGINATION ====================
  getAllItems: async (req, res) => {
    try {
      console.log('➡️ GET /api/items/all');
      
      // Récupérer les paramètres de pagination depuis la query string
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const page = Math.floor(offset / limit) + 1;
      
      // Récupérer les items et le total
      const [items, total] = await Promise.all([
        Items.findAll(limit, offset),
        Items.count()
      ]);
      
      console.log(`✅ ${items.length} items récupérés sur ${total}`);
      res.json({
        success: true,
        count: items.length,
        total: total,
        data: items,
        pagination: {
          page: page,
          limit: limit,
          offset: offset,
          totalPages: Math.ceil(total / limit),
          hasNext: offset + limit < total,
          hasPrevious: offset > 0,
          next: offset + limit < total ? offset + limit : null,
          previous: offset > 0 ? Math.max(0, offset - limit) : null
        }
      });
    } catch (error) {
      console.error('❌ Erreur GET /all:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // ==================== SEARCH ====================
  searchItems: async (req, res) => {
    try {
      const searchTerm = req.query.q || '';
      console.log('➡️ GET /api/items/search - Terme:', searchTerm);
      
      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          error: 'Paramètre de recherche "q" requis'
        });
      }
      
      const result = await Items.search(searchTerm);
      
      console.log(`✅ ${result.length} items trouvés`);
      res.json({
        success: true,
        count: result.length,
        searchTerm: searchTerm,
        data: result
      });
    } catch (error) {
      console.error('❌ Erreur GET /search:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // ==================== FILTER BY TYPE ====================
  getItemsByType: async (req, res) => {
    try {
      const type = req.params.type;
      console.log('➡️ GET /api/items/type/' + type);
      
      const result = await Items.findByType(type);
      
      console.log(`✅ ${result.length} items de type "${type}" trouvés`);
      res.json({
        success: true,
        count: result.length,
        type: type,
        data: result
      });
    } catch (error) {
      console.error('❌ Erreur GET /type:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // ==================== FILTER BY STATUS ====================
  getItemsByStatus: async (req, res) => {
    try {
      const status = req.params.status;
      console.log('➡️ GET /api/items/status/' + status);
      
      const result = await Items.findByStatus(status);
      
      console.log(`✅ ${result.length} items avec statut "${status}" trouvés`);
      res.json({
        success: true,
        count: result.length,
        status: status,
        data: result
      });
    } catch (error) {
      console.error('❌ Erreur GET /status:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // ==================== STATISTICS ====================
  getStatistics: async (req, res) => {
    try {
      console.log('➡️ GET /api/items/statistics');
      
      const [total, statsByType, statsByStatus] = await Promise.all([
        Items.count(),
        Items.getStatsByType(),
        Items.getStatsByStatus()
      ]);
      
      console.log('✅ Statistiques récupérées avec succès');
      res.json({
        success: true,
        data: {
          total: total,
          byType: statsByType,
          byStatus: statsByStatus
        }
      });
    } catch (error) {
      console.error('❌ Erreur GET /statistics:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // ==================== BATCH CREATE ====================
  createBatch: async (req, res) => {
    try {
      console.log('➡️ POST /api/items/batch');
      console.log(`Nombre d'items à créer: ${req.body.length}`);
      
      if (!Array.isArray(req.body)) {
        return res.status(400).json({
          success: false,
          error: 'Le body doit être un tableau d\'objets'
        });
      }
      
      // Nettoyer chaque item
      const cleanedData = req.body.map(item => cleanEmptyFields(item));
      
      // Créer en batch
      const result = await Items.createMany(cleanedData);
      
      console.log(`✅ ${result.length} items créés avec succès`);
      res.status(201).json({
        success: true,
        message: `${result.length} items créés avec succès`,
        count: result.length,
        data: result
      });
    } catch (error) {
      console.error('❌ Erreur POST /batch:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
};

// ==================== FONCTION UTILITAIRE ====================
function cleanEmptyFields(obj) {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key, value]) => {
        // Garder les valeurs non vides
        return value !== undefined && value !== null && value !== '';
      })
      .map(([key, value]) => {
        // Nettoyer les espaces des chaînes
        if (typeof value === 'string') {
          return [key, value.trim()];
        }
        return [key, value];
      })
  );
}

console.log('✅ Contrôleur items initialisé avec succès');

module.exports = itemsController;