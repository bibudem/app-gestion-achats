const pool = require('../config/supabase.config'); 

class Items {

  // CREATE
  static async create(data) {
    const cols = Object.keys(data);
    const values = Object.values(data);

    const placeholders = cols.map((c, i) => `$${i + 1}`).join(', ');
    const sql = `
      INSERT INTO tbl_items (${cols.join(', ')})
      VALUES (${placeholders})
      RETURNING *;
    `;

    return pool.query(sql, values);
  }

  // READ (single item)
  static async findById(id) {
    const sql = `SELECT * FROM tbl_items WHERE id_item = $1`;
    return pool.query(sql, [id]);
  }

  // READ (list + pagination)
  static async findAll(limit = 50, offset = 0) {
    const sql = `
      SELECT * FROM tbl_items
      ORDER BY date_creation DESC
      LIMIT $1 OFFSET $2
    `;
    return pool.query(sql, [limit, offset]);
  }

  // UPDATE
  static async update(id, data) {
    const cols = Object.keys(data);
    const values = Object.values(data);

    const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');

    const sql = `
      UPDATE tbl_items 
      SET ${sets}
      WHERE id_item = $${cols.length + 1}
      RETURNING *;
    `;

    return pool.query(sql, [...values, id]);
  }

  // DELETE
  static async delete(id) {
    const sql = `DELETE FROM tbl_items WHERE id_item = $1`;
    return pool.query(sql, [id]);
  }
}

module.exports = Items;
