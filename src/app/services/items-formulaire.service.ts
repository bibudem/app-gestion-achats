import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

// Interface correspondant à votre table tbl_items
export interface Item {
  // Identifiant principal
  item_id?: number;
  formulaire_id?: number;
  
  // Champs communs à tous les formulaires
  date_creation?: string;
  priorite_demande?: string;
  titre_document: string;
  sous_titre?: string;
  isbn_issn?: string;
  editeur?: string;
  date_publication?: string;
  
  // Informations catalogage
  creation_notice_dtdm?: boolean;
  note_dtdm?: string;
  
  // Catégorie document
  categorie_document?: string;
  
  // Format/Support
  format_support?: string;
  
  // Informations financières communes
  fonds_budgetaire?: string;
  fonds_sn_projet?: string;
  
  // Bibliothèque
  bibliotheque?: string;
  localisation_emplacement?: string;
  
  // Personnes concernées
  demandeur: string;
  personne_a_aviser_activation?: string;
  
  // Projets spéciaux
  projet_special?: string;
  
  // Statuts
  statut_bibliotheque?: string;
  statut_acq?: string;
  
  // Informations additionnelles communes
  source_information?: string;
  note_commentaire?: string;
  id_ressource?: string;
  catalogue?: string;
  
  // Métadonnées
  date_modification?: string;
  utilisateur_modification?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  // Optionnel : si tu as d'autres champs comme message, pagination, etc.
  message?: string;
}


@Injectable({
  providedIn: "root",
})
export class ItemFormulaireService {
  private url = "http://localhost:9111/api/items"; // URL de votre backend

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ 
      "Content-Type": "application/json",
    }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}

  // ==================== CRUD OPERATIONS ====================

  // CREATE - Ajouter un nouvel item
  create(item: Item): Observable<Item> {
    return this.http
      .post<Item>(`${this.url}/add`, item, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<Item>("create")));
  }

  // Alias pour create (post)
  post(item: Item): Observable<Item> {
    console.log('Données envoyées à l\'API:', item);
    return this.create(item);
  }

  // READ ALL - Récupérer tous les items
  getAll(): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/all`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<Item[]>("getAll")));
  }

  // READ ONE - Récupérer un item par ID
  getById(id: number): Observable<Item> {
    return this.http
      .get<Item>(`${this.url}/fiche/${id}`, this.httpOptions) // CORRECTION: Supprimer le : avant ${id}
      .pipe(catchError(this.errorHandlerService.handleError<Item>("getById")));
  }

  // Alias pour getById
 consulter(id: number): Observable<ApiResponse<Item>> {
  return this.http.get<ApiResponse<Item>>(`${this.url}/fiche/${id}`, this.httpOptions)
    .pipe(catchError(this.errorHandlerService.handleError<ApiResponse<Item>>("consulter")));
}


  // UPDATE - Mettre à jour un item
 update(item: Item): Observable<ApiResponse<Item>> {
  if (!item.item_id) {
    return throwError(() => new Error("ID de l'item manquant pour la mise à jour"));
  }

  return this.http
    .put<ApiResponse<Item>>(`${this.url}/save/${item.item_id}`, item, this.httpOptions)
    .pipe(catchError(this.errorHandlerService.handleError<ApiResponse<Item>>("update")));
}


  // DELETE - Supprimer un item
  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.url}/delete/${id}`, this.httpOptions) // CORRECTION: Supprimer le : avant ${id}
      .pipe(catchError(this.errorHandlerService.handleError<void>("delete")));
  }

  // ==================== FILTERING & SEARCH ====================

  // SEARCH - Rechercher des items
  search(term: string): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/search?q=${encodeURIComponent(term)}`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<Item[]>("search")));
  }

  // FILTER BY TYPE - Filtrer par type de formulaire
  getByType(type: string): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/type/${encodeURIComponent(type)}`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<Item[]>("getByType")));
  }

  // FILTER BY STATUS - Filtrer par statut
  getByStatus(status: string): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/status/${encodeURIComponent(status)}`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<Item[]>("getByStatus")));
  }


  
  advancedSearch(filters: {
    searchTerm?: string;
    bibliotheque?: string;
    statutBibliotheque?: string;
    statutAcq?: string;
    categorieDocument?: string;
    formatSupport?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Observable<Item[]> {
    // Pour l'instant, utiliser la recherche simple si un terme est fourni
    if (filters.searchTerm) {
      return this.search(filters.searchTerm);
    }
    
    // Sinon, filtrer côté client
    return this.getAll().pipe(
      catchError(this.errorHandlerService.handleError<Item[]>("advancedSearch"))
    );
  }

  // ==================== TEST ROUTE ====================

  // Tester la connexion à l'API
  testConnection(): Observable<any> {
    return this.http
      .get<any>(`${this.url}/test`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("testConnection")));
  }

  // ==================== UTILITY METHODS ====================

  // Validation des données avant soumission
  validateItem(item: Item): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation des champs obligatoires
    if (!item.titre_document || item.titre_document.trim() === '') {
      errors.push('Le titre du document est obligatoire');
    }

    if (!item.demandeur || item.demandeur.trim() === '') {
      errors.push('Le demandeur est obligatoire');
    }

    if (!item.fonds_budgetaire || item.fonds_budgetaire.trim() === '') {
      errors.push('Le fonds budgétaire est obligatoire');
    }

    // Validation des longueurs maximales
    if (item.titre_document && item.titre_document.length > 500) {
      errors.push('Le titre du document ne peut pas dépasser 500 caractères');
    }

    if (item.sous_titre && item.sous_titre.length > 500) {
      errors.push('Le sous-titre ne peut pas dépasser 500 caractères');
    }

    if (item.isbn_issn && item.isbn_issn.length > 50) {
      errors.push('L\'ISBN/ISSN ne peut pas dépasser 50 caractères');
    }

    if (item.editeur && item.editeur.length > 300) {
      errors.push('L\'éditeur ne peut pas dépasser 300 caractères');
    }

    if (item.demandeur && item.demandeur.length > 200) {
      errors.push('Le demandeur ne peut pas dépasser 200 caractères');
    }

    if (item.fonds_budgetaire && item.fonds_budgetaire.length > 200) {
      errors.push('Le fonds budgétaire ne peut pas dépasser 200 caractères');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Formater les données pour l'API
  formatForApi(item: Item): Item {
    return {
      ...item,
      // Assurer que les booléens sont convertis correctement
      creation_notice_dtdm: item.creation_notice_dtdm || false,
      // Nettoyer les chaînes vides
      titre_document: item.titre_document?.trim() || '',
      demandeur: item.demandeur?.trim() || '',
      fonds_budgetaire: item.fonds_budgetaire?.trim() || '',
      // Ajouter la date de modification si c'est une mise à jour
      ...(item.item_id && { date_modification: new Date().toISOString() })
    };
  }

  // NOTE: Les méthodes suivantes n'ont pas de routes correspondantes dans votre API
  // Elles sont commentées car elles causeront des erreurs 404

  /*
  getStats(): Observable<any> {
    return this.http
      .get<any>(`${this.url}/stats`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("getStats")));
  }

  getStatsByBibliotheque(): Observable<any> {
    return this.http
      .get<any>(`${this.url}/stats/bibliotheque`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("getStatsByBibliotheque")));
  }

  getStatsByStatut(): Observable<any> {
    return this.http
      .get<any>(`${this.url}/stats/statut`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("getStatsByStatut")));
  }

  getStatsByCategorie(): Observable<any> {
    return this.http
      .get<any>(`${this.url}/stats/categorie`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("getStatsByCategorie")));
  }

  getStatsByMonth(): Observable<any> {
    return this.http
      .get<any>(`${this.url}/stats/mois`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("getStatsByMonth")));
  }

  exportData(format: 'csv' | 'excel' = 'csv'): Observable<Blob> {
    return this.http
      .get(`${this.url}/export?format=${format}`, {
        ...this.httpOptions,
        responseType: 'blob'
      })
      .pipe(catchError(this.errorHandlerService.handleError<Blob>("exportData")));
  }

  downloadTemplate(): Observable<Blob> {
    return this.http
      .get(`${this.url}/template`, {
        ...this.httpOptions,
        responseType: 'blob'
      })
      .pipe(catchError(this.errorHandlerService.handleError<Blob>("downloadTemplate")));
  }

  importData(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http
      .post<any>(`${this.url}/import`, formData)
      .pipe(catchError(this.errorHandlerService.handleError<any>("importData")));
  }
  */
}