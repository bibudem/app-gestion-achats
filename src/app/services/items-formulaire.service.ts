import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

// Interface correspondant à votre structure de base de données
export interface Item {
  // Identifiant principal
  id_item?: number;
  
  // Métadonnées du formulaire
  type_formulaire: string;
  date_creation?: string;
  date_modification?: string;
  
  // Priorité et projets
  priorite_demande?: string;
  projets_speciaux?: string;
  
  // Informations du document
  titre_document: string;
  sous_titre?: string;
  isbn_issn?: string;
  editeur_document?: string;
  date_publication?: string;
  auteur?: string;
  
  // Catalogage et notices
  creation_notice_dtdm?: boolean;
  note_dtdm?: string;
  numero_oclc_existant?: string;
  catalogage?: string;
  note_catalogueur?: string;
  
  // Période et couverture
  periode_couverte?: string;
  date_debut_abonnement?: string;
  nombre_titres_inclus?: string;
  
  // Source et références
  source_information?: string;
  lien_plateforme?: string;
  id_ressource?: string;
  collection?: string;
  
  // Catégorisation
  categorie_document?: string;
  type_monographie?: string;
  format_support?: string;
  categorie_depense?: string;
  
  // Format électronique spécifique
  pret_numerique_format?: string;
  plateforme_privilegier?: string;
  
  // Accès et utilisateurs
  nombre_utilisateurs?: string;
  
  // Localisation
  bibliotheque?: string;
  localisation_emplacement?: string;
  
  // Budget et prix
  fonds_budgetaire?: string;
  fonds_sn_projet?: string;
  quantite?: number;
  prix_cad?: number;
  devise_originale?: string;
  prix_devise_originale?: number;
  
  // Personnes impliquées - Bibliothèque
  bib_nom_demandeur?: string;
  bib_personne_aviser?: string;
  
  // Personnes impliquées - Usagers
  usager_aviser_reservation?: string;
  usager_aviser_activation?: string;
  
  // Réserve de cours
  reserve_cours?: boolean;
  reserve_cours_sigle?: string;
  reserve_cours_session?: string;
  reserve_cours_enseignant?: string;
  reserve_cours_mise_a_reserve?: string;
  enseignants_requis_pour_cours?: string;
  
  // Notes et commentaires
  bib_note_commentaire?: string;
  usager_notes_commentaires?: string;
  
  // Statuts
  bib_statut_demande?: string;
  dircol_acq_statut_demande?: string;
  dircol_acq_suivi_demande?: string;
  dircol_acq_note?: string;
  dircol_acq_bordereau_imprime?: string;
  accessibilite_statut_demande?: string;
  
  // Précision de la demande
  precision_demande?: string;
  
  // PEB-Tipasa spécifique
  reference_usager_tipasa?: string;
  vu_format_numerique_oasis?: string;
  version_moins_365_usd?: string;
  dircol_acq_responsable?: string;
  
  // Suggestion d'achats - Usagers
  usager_nom?: string;
  usager_categorie?: string;
  usager_faculte_dept?: string;
  usager_courriel?: string;
  usager_bibliotheque?: string;
  bibliothecaire_disciplinaire?: string;
  usager_aviser_document_recu?: boolean;
  acq_isbn?: string;
  dircol_acq_raison_annulation?: string;
  techdoc_tri_suggestion_transmise?: boolean;
  techdoc_tri_notes?: string;
  suivi_reservation_arrivee?: string;
  enseignants_mettre_reserve?: string;
  
  // Accessibilité
  accessibilite_nom_demandeur?: string;
  besoin_specifique_format?: string;
  exemplaire_electronique_detenu?: string;
  exemplaire_papier_detenu?: string;
  fonds_budgetaire_si_achat?: string;
  fournisseur_contacte_sans_succes?: boolean;
  isbn_document?: string;
  localisation?: string;
  no_notice_oclc?: number;
  permalien_sofia?: string;
  reference_usager?: string;
  reserver_pour_usager?: string;
  si_electronique_nb_utilisateurs?: string;
  si_electronique_lien?: string;
  si_electronique_nb_usagers?: string;
  source_info_editeur?: string;
  verification_caeb?: string;
  verification_emma?: string;
  verification_sqla?: string;
  dircol_acq_date_demande_editeur?: string;
  dircol_acq_date_livraison_estimee?: string;
  dircol_acq_numerisation_recommandee?: boolean;
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

  // Créer un nouvel item
  post(item: Item): Observable<any> {
    return this.http
      .post<Partial<Item>>(`${this.url}/add`, item, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  // Mettre à jour un item existant
  update(item: Item): Observable<any> {
    return this.http
      .put<Item>(`${this.url}/save`, item, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  // Supprimer un item
  delete(id: number): Observable<any> {
    return this.http
      .delete<Item>(`${this.url}/delete/${id}`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }

  // Consulter un item spécifique
  consulter(id: number): Observable<any> {
    return this.http
      .get<Item>(`${this.url}/fiche/${id}`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter")));
  }

  // NOUVELLES MÉTHODES POUR LA LISTE

  // Récupérer tous les items
  getAll(): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/all`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<Item[]>("getAll")));
  }

  // Rechercher des items
  search(term: string): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/search?q=${term}`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<Item[]>("search")));
  }

  // Filtrer par type de formulaire
  getByType(type: string): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/type/${type}`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<Item[]>("getByType")));
  }

  // Filtrer par statut
  getByStatus(status: string): Observable<Item[]> {
    return this.http
      .get<Item[]>(`${this.url}/status/${status}`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<Item[]>("getByStatus")));
  }

  // Récupérer les statistiques
  getStats(): Observable<any> {
    return this.http
      .get<any>(`${this.url}/stats`, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("getStats")));
  }
  
}