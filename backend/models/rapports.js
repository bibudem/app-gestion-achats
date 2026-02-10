// models/rapports.js
const pool = require('../config/postgres.config');

/**
 * ⚙️ À ADAPTER (IMPORTANT)
 * Remplace les valeurs par les VRAIS noms de colonnes de ta table.
 * Ton CSV montre 28 champs sans en-tête, donc je ne peux pas garantir les noms exacts. [1](https://udemontreal-my.sharepoint.com/personal/natalia_jabinschi_umontreal_ca/_layouts/15/Doc.aspx?sourcedoc=%7BA03DA1EA-F6A4-47B8-93D9-086C71F03D48%7D&file=sql-table.csv&action=default&mobileredirect=true)
 */
const COL = {
  table: 'tbl_items',

  id: 'id',
  formulaireType: 'formulaire_type',
  dateCreation: 'date_creation',
  priorite: 'priorite',
  titre: 'titre',
  sousTitre: 'sous_titre',
  identifiant: 'identifiant', // ex: isbn_issn / numero / etc.
  editeur: 'editeur',
  annee: 'annee_publication',

  typeDocument: 'type_document',
  support: 'support',
  fonds: 'fonds_budgetaire',
  bibliotheque: 'bibliotheque',
  demandeur: 'demandeur',

  // Tes données montrent des statuts "En attente en bibliothèque" et "Soumis aux ACQ" + "Demande annulée". [1](https://udemontreal-my.sharepoint.com/personal/natalia_jabinschi_umontreal_ca/_layouts/15/Doc.aspx?sourcedoc=%7BA03DA1EA-F6A4-47B8-93D9-086C71F03D48%7D&file=sql-table.csv&action=default&mobileredirect=true)
  statutBibliotheque: 'statut_bibliotheque', // à confirmer
  statutAcq: 'statut_acq', // à confirmer

  updatedAt: 'date_modification' // ou updated_at
};

// Libellés de statuts (à ajuster selon tes valeurs réelles)
const STATUTS = {
  BIB_EN_ATTENTE: ['En attente en bibliothèque', 'En attente'],
  BIB_EN_TRAITEMENT: ['En traitement', 'En traitement en bibliothèque'],
  BIB_TERMINE: ['Terminé'],
  ACQ_SOUMIS: ['Soumis aux ACQ'],
  ACQ_ANNULEE: ['Demande annulée']
};

function isValidDateString(s) {
  return typeof s === 'string' && !Number.isNaN(Date.parse(s));
}

function normalizePagination(limit, offset) {
  const l = Math.min(Math.max(parseInt(limit ?? 100, 10) || 100, 1), 500);
  const o = Math.max(parseInt(offset ?? 0, 10) || 0, 0);
  return { limit: l, offset: o };
}

/**
 * Clause de date inclusive (inclut la journée complète de dateFin)
 */
function buildDateClause(dateDebut, dateFin, params, idxStart = 1) {
  let idx = idxStart;
  if (dateDebut && dateFin) {
    if (!isValidDateString(dateDebut) || !isValidDateString(dateFin)) {
      throw new Error('Paramètres de date invalides (dateDebut/dateFin).');
    }
    const clause =
      `${COL.dateCreation} >= $${idx}::timestamptz ` +
      `AND ${COL.dateCreation} < ($${idx + 1}::timestamptz + interval '1 day')`;
    params.push(dateDebut, dateFin);
    return { clause, idx: idx + 2 };
  }
  return { clause: '', idx };
}

/**
 * ✅ Whitelist des filtres autorisés (API -> colonne DB)
 * Empêche l'injection SQL par nom de colonne.
 */
const ALLOWED_FILTERS = {
  id: COL.id,
  formulaireType: COL.formulaireType,
  priorite: COL.priorite,
  bibliotheque: COL.bibliotheque,
  demandeur: COL.demandeur,
  typeDocument: COL.typeDocument,
  support: COL.support,
  fonds: COL.fonds,
  editeur: COL.editeur,
  annee: COL.annee,
  statutBibliotheque: COL.statutBibliotheque,
  statutAcq: COL.statutAcq
};

// ==================== STATISTIQUES GÉNÉRALES ====================
async function statistiquesGenerales({ dateDebut, dateFin }) {
  const params = [];
  let idx = 1;
  const whereParts = [];

  const { clause, idx: idxAfterDate } = buildDateClause(dateDebut, dateFin, params, idx);
  idx = idxAfterDate;
  if (clause) whereParts.push(clause);

  const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

  // NB : Si ta table n'a pas "montant", retire ces lignes (ou adapte COL.montant)
  const hasMontant = true; // mets false si tu n'as pas de colonne "montant"
  const montantSelect = hasMontant
    ? `,
      COALESCE(SUM(COALESCE(montant, 0)), 0)::numeric AS montant_total,
      AVG(montant)::numeric AS montant_moyen`
    : `, 0::numeric AS montant_total, NULL::numeric AS montant_moyen`;

  const query = `
    SELECT
      COUNT(*)::int AS total_items,
      COUNT(DISTINCT ${COL.demandeur})::int AS total_demandeurs,

      COUNT(*) FILTER (WHERE ${COL.statutBibliotheque} = ANY($${idx}))::int AS bib_en_attente,
      COUNT(*) FILTER (WHERE ${COL.statutBibliotheque} = ANY($${idx + 1}))::int AS bib_en_traitement,
      COUNT(*) FILTER (WHERE ${COL.statutBibliotheque} = ANY($${idx + 2}))::int AS bib_termines,

      COUNT(*) FILTER (WHERE ${COL.statutAcq} = ANY($${idx + 3}))::int AS acq_soumis,
      COUNT(*) FILTER (WHERE ${COL.statutAcq} = ANY($${idx + 4}))::int AS acq_annulees
      ${montantSelect}
    FROM ${COL.table}
    ${where}
  `;

  params.push(
    STATUTS.BIB_EN_ATTENTE,
    STATUTS.BIB_EN_TRAITEMENT,
    STATUTS.BIB_TERMINE,
    STATUTS.ACQ_SOUMIS,
    STATUTS.ACQ_ANNULEE
  );

  const { rows } = await pool.query(query, params);
  return rows[0];
}

// ==================== RAPPORT PAR TYPE ====================
async function rapportParType({ dateDebut, dateFin, formulaireType }) {
  const params = [];
  let idx = 1;
  const whereParts = ['1=1'];

  const { clause, idx: idxAfterDate } = buildDateClause(dateDebut, dateFin, params, idx);
  idx = idxAfterDate;
  if (clause) whereParts.push(clause);

  if (formulaireType) {
    whereParts.push(`${COL.formulaireType} = $${idx}`);
    params.push(formulaireType);
    idx += 1;
  }

  const where = `WHERE ${whereParts.join(' AND ')}`;

  const query = `
    SELECT
      ${COL.formulaireType} AS formulaire_type,
      COUNT(*)::int AS total,

      COUNT(*) FILTER (WHERE ${COL.statutBibliotheque} = ANY($${idx}))::int AS bib_en_attente,
      COUNT(*) FILTER (WHERE ${COL.statutBibliotheque} = ANY($${idx + 1}))::int AS bib_en_traitement,
      COUNT(*) FILTER (WHERE ${COL.statutBibliotheque} = ANY($${idx + 2}))::int AS bib_termines,

      COUNT(*) FILTER (WHERE ${COL.statutAcq} = ANY($${idx + 3}))::int AS acq_soumis,
      COUNT(*) FILTER (WHERE ${COL.statutAcq} = ANY($${idx + 4}))::int AS acq_annulees

    FROM ${COL.table}
    ${where}
    GROUP BY ${COL.formulaireType}
    ORDER BY total DESC
  `;

  params.push(
    STATUTS.BIB_EN_ATTENTE,
    STATUTS.BIB_EN_TRAITEMENT,
    STATUTS.BIB_TERMINE,
    STATUTS.ACQ_SOUMIS,
    STATUTS.ACQ_ANNULEE
  );

  const { rows } = await pool.query(query, params);
  return rows;
}

// ==================== RAPPORT DÉTAILLÉ ====================
async function rapportDetaille(filters = {}, limit = 100, offset = 0) {
  const params = [];
  let idx = 1;
  const conditions = [];

  // Date
  if (filters.dateDebut && filters.dateFin) {
    const { clause, idx: idxAfterDate } = buildDateClause(
      filters.dateDebut,
      filters.dateFin,
      params,
      idx
    );
    if (clause) conditions.push(clause);
    idx = idxAfterDate;
  }

  // Autres filtres (whitelist)
  for (const [apiKey, dbCol] of Object.entries(ALLOWED_FILTERS)) {
    const value = filters[apiKey];
    if (value === undefined || value === null || value === '') continue;

    // Recherche partielle utile (demandeur, titre)
    if (apiKey === 'demandeur' && typeof value === 'string') {
      conditions.push(`${dbCol} ILIKE $${idx}`);
      params.push(`%${value}%`);
      idx += 1;
      continue;
    }

    conditions.push(`${dbCol} = $${idx}`);
    params.push(value);
    idx += 1;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { limit: l, offset: o } = normalizePagination(limit, offset);

  const query = `
    SELECT *
    FROM ${COL.table}
    ${where}
    ORDER BY ${COL.dateCreation} DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM ${COL.table}
    ${where}
  `;

  const [data, count] = await Promise.all([
    pool.query(query, [...params, l, o]),
    pool.query(countQuery, params)
  ]);

  return {
    data: data.rows,
    total: count.rows[0]?.total ?? 0,
    limit: l,
    offset: o
  };
}

module.exports = {
  COL,
  STATUTS,
  statistiquesGenerales,
  rapportParType,
  rapportDetaille
};