const pool = require('../config/postgres.config');

class Items {

  // ==================== CREATE ====================
  static async create(data) {
    const client = await pool.connect();
    try {
      // Construire dynamiquement la requête INSERT
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `
        INSERT INTO tbl_items (${columns})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      console.log('📝 Exécution INSERT:', query.substring(0, 100) + '...');
      const result = await client.query(query, values);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== READ ONE ====================
  static async findById(id) {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM tbl_items WHERE item_id = $1';
      
      console.log('📝 Exécution SELECT BY ID:', id);
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Item non trouvé');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== READ ALL + PAGINATION ====================
  static async findAll(limit = 50, offset = 0) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM tbl_items
        ORDER BY date_creation DESC
        LIMIT $1 OFFSET $2
      `;
      
      console.log(`📝 Exécution SELECT ALL - Limit: ${limit}, Offset: ${offset}`);
      const result = await client.query(query, [limit, offset]);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== UPDATE ====================
 static async update(id, data) {
  const client = await pool.connect();
  try {
    // Exclure date_modification si présent
    const dataCopy = { ...data };
    delete dataCopy.date_modification;

    const entries = Object.entries(dataCopy);
    if (entries.length === 0) {
      throw new Error('Aucune donnée à mettre à jour');
    }

    const setClause = entries.map(([key], i) => `${key} = $${i + 1}`).join(', ');
    const values = [...entries.map(([, val]) => val), id];

    const query = `
      UPDATE tbl_items
      SET ${setClause}, date_modification = CURRENT_TIMESTAMP
      WHERE item_id = $${entries.length + 1}
      RETURNING *
    `;

    console.log('📝 Exécution UPDATE:', query.substring(0, 100) + '...');
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Item non trouvé pour la mise à jour');
    }

    return result.rows;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    throw error;
  } finally {
    client.release();
  }
}

  // ==================== DELETE ====================
  static async delete(id) {
    const client = await pool.connect();
    try {
      const query = `
        DELETE FROM tbl_items
        WHERE item_id = $1
        RETURNING *
      `;
      
      console.log('📝 Exécution DELETE:', id);
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Item non trouvé pour la suppression');
      }
      
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== SEARCH ====================
  static async search(searchTerm) {
    const client = await pool.connect();
    try {
      // Recherche dans plusieurs colonnes avec ILIKE (insensible à la casse)
      const query = `
        SELECT * FROM tbl_items
        WHERE 
          titre ILIKE $1 OR
          description ILIKE $1 OR
          titre_document ILIKE $1 OR
          auteur ILIKE $1 OR
          isbn_issn ILIKE $1
        ORDER BY date_creation DESC
      `;
      
      const searchPattern = `%${searchTerm}%`;
      console.log('📝 Exécution SEARCH:', searchPattern);
      
      const result = await client.query(query, [searchPattern]);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== FILTER BY TYPE ====================
  static async findByType(type) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM tbl_items
        WHERE type_formulaire = $1
        ORDER BY date_creation DESC
      `;
      
      console.log('📝 Exécution FILTER BY TYPE:', type);
      const result = await client.query(query, [type]);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors du filtrage par type:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== FILTER BY STATUS ====================
  static async findByStatus(status) {
    const client = await pool.connect();
    try {
      const query = `
        SELECT * FROM tbl_items
        WHERE bib_statut_demande = $1
        ORDER BY date_creation DESC
      `;
      
      console.log('📝 Exécution FILTER BY STATUS:', status);
      const result = await client.query(query, [status]);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors du filtrage par statut:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== COUNT TOTAL ====================
  static async count() {
    const client = await pool.connect();
    try {
      const query = 'SELECT COUNT(*) as total FROM tbl_items';
      
      console.log('📝 Exécution COUNT');
      const result = await client.query(query);
      
      return parseInt(result.rows[0].total);
    } catch (error) {
      console.error('❌ Erreur lors du comptage:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== STATISTICS BY TYPE ====================
  static async getStatsByType() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          type_formulaire,
          COUNT(*) as count
        FROM tbl_items
        GROUP BY type_formulaire
        ORDER BY count DESC
      `;
      
      console.log('📝 Exécution STATS BY TYPE');
      const result = await client.query(query);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors des statistiques:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== STATISTICS BY STATUS ====================
  static async getStatsByStatus() {
    const client = await pool.connect();
    try {
      const query = `
        SELECT 
          bib_statut_demande,
          COUNT(*) as count
        FROM tbl_items
        GROUP BY bib_statut_demande
        ORDER BY count DESC
      `;
      
      console.log('📝 Exécution STATS BY STATUS');
      const result = await client.query(query);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Erreur lors des statistiques:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==================== BATCH INSERT ====================
  static async createMany(dataArray) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const results = [];
      
      for (const data of dataArray) {
        const columns = Object.keys(data).join(', ');
        const values = Object.values(data);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
          INSERT INTO tbl_items (${columns})
          VALUES (${placeholders})
          RETURNING *
        `;
        
        const result = await client.query(query, values);
        results.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      console.log(`✅ ${results.length} items insérés avec succès`);
      
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erreur lors de l\'insertion en batch:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Items;