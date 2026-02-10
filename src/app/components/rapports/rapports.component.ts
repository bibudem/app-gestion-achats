import { Component, OnInit, ViewChild } from '@angular/core';
import { MethodesGlobal } from "../../lib/MethodesGlobal";
import { Observable } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { RapportsService, FiltresRapport, ApiResponse } from '../../services/rapports.service';

interface TypeRapport {
  id: 'detaille' | 'par-type' | 'par-bibliotheque' | 'par-demandeur' | 'mensuel' | 'par-statut';
  nom: string;
  description: string;
}

@Component({
  selector: 'app-rapports',
  templateUrl: './rapports.component.html',
  styleUrls: ['./rapports.component.css']
})
export class RapportsComponent implements OnInit {
  // Importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();

  // Observable pour les données
  rapport$: Observable<any> | undefined;
  listeRapport: any = [];
  isLoading = false;

  // DataSource pour Material Table
  // @ts-ignore
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild(MatSort) matSort: MatSort | any;

  // Titres des champs
  champsTitre: any = {};
  champsDisponibles: string[] = [];
  colonnesSelectionnees: string[] = [];

  // Filtres
  filtres: FiltresRapport = {
    dateDebut: '',
    dateFin: '',
    formulaireType: '',
    bibliotheque: '',
    statutBibliotheque: '',
    statutAcq: '',
    priorite: '',
    demandeur: '',
    limit: 50,
    offset: 0
  };

  filtresMatSelect: any = {};

  // Nom du fichier Excel
  fileName = 'rapport.xlsx';

  totalDonnees = 0;

  // Pagination
  limit = 50;
  offset = 0;

  // Type de rapport sélectionné
  rapportSelectionneId: TypeRapport['id'] = 'detaille';

  // Options disponibles
  readonly typesFormulaires: string[] = [
    'Modification CCOL',
    'Nouvel abonnement',
    'Nouvel achat unique',
    'PEB Tipasa numérique',
    'Requête ACQ',
    'Springer',
    "Suggestion d'achat"
  ];

  readonly statutsBibliotheque: string[] = [
    'En attente en bibliothèque',
    'En attente',
    'En traitement',
    'Terminé'
  ];

  readonly statutsAcq: string[] = [
    'Soumis aux ACQ',
    'Demande annulée'
  ];

  readonly priorites: string[] = ['Urgent', 'Régulier', 'Basse'];

  readonly bibliotheques: string[] = [
    'Bibliothèque des lettres et sciences humaines',
    'Bibliothèque des sciences',
    'Bibliothèque de droit',
    "Bibliothèque d'aménagement",
    'Bibliothèque de médecine vétérinaire',
    'Bibliothèque de santé'
  ];

  readonly rapportsDisponibles: TypeRapport[] = [
    { id: 'detaille', nom: 'Rapport détaillé', description: 'Liste et filtres avancés avec pagination' },
    { id: 'par-type', nom: 'Par type', description: 'Synthèse par type de formulaire' },
    { id: 'par-bibliotheque', nom: 'Par bibliothèque', description: 'Répartition par bibliothèque' },
    { id: 'par-demandeur', nom: 'Par demandeur', description: 'Analyse des demandes par demandeur' },
    { id: 'mensuel', nom: 'Évolution mensuelle', description: "Tendance mensuelle sur une année" },
    { id: 'par-statut', nom: 'Par statut', description: 'Distribution par statut' }
  ];

  constructor(
    private rapportsService: RapportsService,
    private translate: TranslateService,
    private router: Router,
  ) { }

  async ngOnInit() {
    // Initialiser les dates par défaut (mois courant)
    const { dateDebut, dateFin } = this.rapportsService.getCurrentMonthDates();
    this.filtres.dateDebut = dateDebut;
    this.filtres.dateFin = dateFin;

    // Cacher le contenu du rapport au démarrage
    this.methodesGlobal.nonAfficher('contenuRapport');

    // Initialiser les titres des champs
    this.initTitreChamps();

    // Colonnes par défaut pour le rapport détaillé
    this.colonnesSelectionnees = ['id', 'formulaire_type', 'demandeur', 'bibliotheque', 'statut_bibliotheque', 'date_creation'];
  }

  initTitreChamps() {
    this.translate.get('labels-rapport').subscribe((res: any) => {
      this.champsTitre = res;
      this.champsDisponibles = Object.keys(res);
    });
  }

  // Appliquer les filtres Material Select
  implimentationMatFiltre(value: any, id: string) {
    if (value && value.length > 0) {
      this.filtresMatSelect[id] = value;
    } else {
      delete this.filtresMatSelect[id];
    }
  }

  // Gestion des colonnes à afficher
  toggleColonne($event: any): void {
    const checked = $event.target.checked;
    const value = $event.target.value;

    if (checked) {
      if (!this.colonnesSelectionnees.includes(value)) {
        this.colonnesSelectionnees.push(value);
      }
    } else {
      this.colonnesSelectionnees = this.colonnesSelectionnees.filter(col => col !== value);
    }
  }

  // Changer la limite de pagination
  changerLimit(value: number): void {
    this.limit = value;
    this.filtres.limit = value;
    this.offset = 0;
    this.filtres.offset = 0;
  }

  // Charger l'aperçu du rapport
  async chargerApercu(): Promise<void> {
    try {
      this.listeRapport = [];
      this.afficherAnimation();

      // Construire les filtres
      const filtres = this.construireFiltres();
      console.log('🔍 Filtres construits:', filtres);
      console.log('📋 Type de rapport:', this.rapportSelectionneId);

      // Charger les données selon le type de rapport
      const response = await this.fetchRapportResponse(this.rapportSelectionneId, filtres);
      console.log('📦 Réponse reçue:', response);
      
      if (!response || !response.success) {
        console.error('❌ Erreur dans la réponse du serveur:', response);
        alert('Erreur lors du chargement des données. Vérifiez la console.');
        this.nonAfficherAnimation();
        return;
      }
      
      const data = response.data;
      console.log('📊 Données brutes:', data);
      console.log('📏 Type de données:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('📐 Nombre d\'éléments:', Array.isArray(data) ? data.length : 'N/A');

      const rows = Array.isArray(data) ? data : (data ? [data] : []);
      console.log('✅ Lignes à traiter:', rows.length);

      if (rows.length > 0) {
        console.log('🔍 Exemple de première ligne:', rows[0]);
      }

      // Appliquer les filtres Material Select si nécessaire (filtrage côté client)
      const rowsFiltres = this.appliquerFiltresMatSelect(rows);
      console.log('🎯 Lignes après filtrage client:', rowsFiltres.length);

      this.listeRapport = rowsFiltres;

      // Adapter les colonnes selon le type de rapport
      this.adapterColonnesSelonRapport(this.rapportSelectionneId, rowsFiltres);

      // Mise à jour du nom de fichier
      this.fileName = `rapport-${this.rapportSelectionneId}-${this.getDateString()}.xlsx`;

      // Créer le DataSource
      console.log('📋 Création du DataSource avec', this.listeRapport.length, 'lignes');
      this.dataSourcesCreation(this.listeRapport);

    } catch (err) {
      console.error(`❌ Erreur lors du chargement du rapport:`, err);
      alert('Erreur lors du chargement: ' + (err as any)?.message);
      this.nonAfficherAnimation();
    }
  }

  private construireFiltres(): FiltresRapport {
    const filtres: FiltresRapport = {
      dateDebut: this.filtres.dateDebut || undefined,
      dateFin: this.filtres.dateFin || undefined,
      demandeur: this.filtres.demandeur || undefined,
      limit: this.limit,
      offset: this.offset
    };

    // Ajouter les filtres Material Select (envoyés au backend)
    // Note: le backend pourrait ne pas supporter les filtres multiples séparés par virgule
    // Dans ce cas, on fait le filtrage côté client dans appliquerFiltresMatSelect()
    if (this.filtresMatSelect['formulaireType'] && this.filtresMatSelect['formulaireType'].length > 0) {
      // Pour un seul filtre, on peut l'envoyer au backend
      if (this.filtresMatSelect['formulaireType'].length === 1) {
        filtres.formulaireType = this.filtresMatSelect['formulaireType'][0];
      }
    }
    if (this.filtresMatSelect['bibliotheque'] && this.filtresMatSelect['bibliotheque'].length === 1) {
      filtres.bibliotheque = this.filtresMatSelect['bibliotheque'][0];
    }
    if (this.filtresMatSelect['statutBibliotheque'] && this.filtresMatSelect['statutBibliotheque'].length === 1) {
      filtres.statutBibliotheque = this.filtresMatSelect['statutBibliotheque'][0];
    }
    if (this.filtresMatSelect['statutAcq'] && this.filtresMatSelect['statutAcq'].length === 1) {
      filtres.statutAcq = this.filtresMatSelect['statutAcq'][0];
    }
    if (this.filtresMatSelect['priorite'] && this.filtresMatSelect['priorite'].length === 1) {
      filtres.priorite = this.filtresMatSelect['priorite'][0];
    }

    return filtres;
  }

  private appliquerFiltresMatSelect(rows: any[]): any[] {
    let result = [...rows];

    // Appliquer chaque filtre Material Select (filtrage côté client)
    Object.entries(this.filtresMatSelect).forEach(([key, values]: [string, any]) => {
      if (values && Array.isArray(values) && values.length > 0) {
        result = result.filter(row => {
          const rowValue = row[key] || row[this.mapKeyToRowKey(key)];
          return values.includes(rowValue);
        });
      }
    });

    return result;
  }

  private mapKeyToRowKey(key: string): string {
    const mapping: any = {
      'formulaireType': 'formulaire_type',
      'statutBibliotheque': 'statut_bibliotheque',
      'statutAcq': 'statut_acq'
    };
    return mapping[key] || key;
  }

  private adapterColonnesSelonRapport(typeRapport: TypeRapport['id'], rows: any[]): void {
    if (!rows || rows.length === 0) {
      console.warn('⚠️ Aucune donnée pour adapter les colonnes');
      return;
    }

    // Extraire les clés de la première ligne
    const premiereRow = rows[0];
    const clesDisponibles = Object.keys(premiereRow);
    
    console.log('📊 Colonnes disponibles dans les données:', clesDisponibles);
    console.log('📋 Colonnes actuellement sélectionnées:', this.colonnesSelectionnees);

    // Définir les colonnes selon le type de rapport
    switch (typeRapport) {
      case 'detaille':
        // Colonnes prioritaires pour le rapport détaillé
        const colonnesPrioritaires = [
          'id', 'item_id',
          'formulaire_type', 'formulaireType',
          'demandeur',
          'bibliotheque',
          'statut_bibliotheque', 'statutBibliotheque',
          'date_creation',
          'priorite',
          'titre', 'titre_document'
        ];
        
        // Garder les colonnes sélectionnées qui existent dans les données
        let colonnesValides = this.colonnesSelectionnees.filter(col => clesDisponibles.includes(col));
        
        // Si aucune colonne valide, utiliser les colonnes prioritaires qui existent
        if (colonnesValides.length === 0) {
          colonnesValides = colonnesPrioritaires.filter(col => clesDisponibles.includes(col));
        }
        
        // Si toujours rien, prendre les 8 premières colonnes disponibles
        if (colonnesValides.length === 0) {
          colonnesValides = clesDisponibles.slice(0, 8);
        }
        
        this.colonnesSelectionnees = colonnesValides;
        console.log('✅ Colonnes sélectionnées pour détaillé:', this.colonnesSelectionnees);
        break;

      case 'par-type':
      case 'par-bibliotheque':
      case 'par-demandeur':
      case 'mensuel':
      case 'par-statut':
        // Pour les rapports agrégés, afficher toutes les colonnes
        this.colonnesSelectionnees = clesDisponibles;
        console.log('✅ Toutes les colonnes affichées pour rapport agrégé:', this.colonnesSelectionnees);
        break;

      default:
        this.colonnesSelectionnees = clesDisponibles;
    }
  }

  private async fetchRapportResponse(
    type: TypeRapport['id'],
    filtres: FiltresRapport
  ): Promise<ApiResponse<any>> {
    switch (type) {
      case 'detaille':
        return await this.rapportsService.toPromise(this.rapportsService.getRapportDetaille(filtres));

      default:
        return { success: true, data: [], timestamp: new Date().toISOString() };
    }
  }

  // Afficher l'animation de chargement
  afficherAnimation() {
    this.isLoading = true;
    this.methodesGlobal.nonAfficher('page-rapport');
    this.methodesGlobal.afficher('load-import');
  }

  nonAfficherAnimation() {
    this.methodesGlobal.afficher('contenuRapport');
    const that = this;
    setTimeout(async function () {
      that.methodesGlobal.nonAfficher('load-import');
      that.methodesGlobal.afficher('page-rapport');
      that.isLoading = false;
    }, 1500);
  }

  dataSourcesCreation(liste: any) {
    this.dataSource = new MatTableDataSource(liste);
    this.dataSource.paginator = this.paginator;
    this.totalDonnees = liste.length;
    this.dataSource.sort = this.matSort;
    // Afficher le tableau
    this.nonAfficherAnimation();
  }

  // Helpers pour l'affichage
  isStatusColumn(column: string): boolean {
    return [
      'statut_bibliotheque',
      'statutBibliotheque',
      'statut_acq',
      'statutAcq'
    ].includes(column);
  }

  isPriorityColumn(column: string): boolean {
    return column === 'priorite';
  }

  isMoneyColumn(column: string): boolean {
    return column === 'montant' || column === 'montant_total' || column === 'montant_moyen';
  }

  isDateColumn(column: string): boolean {
    return column === 'date_creation' || column === 'date_modification' || 
           column === 'premiere_demande' || column === 'derniere_demande';
  }

  formatCell(column: string, value: any): string {
    if (value === null || value === undefined || value === '') return '-';

    // Date
    if (this.isDateColumn(column)) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const hh = String(d.getHours()).padStart(2, '0');
        const mi = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
      }
      return String(value);
    }

    // Montant
    if (this.isMoneyColumn(column)) {
      const n = Number(value);
      if (!isNaN(n)) {
        return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
      }
      return String(value);
    }

    // Pourcentage
    if (column === 'pourcentage') {
      const n = Number(value);
      if (!isNaN(n)) return `${n.toFixed(1)} %`;
      return String(value);
    }

    return String(value);
  }

  getBadgeClass(value: string): string {
    const v = (value || '').toLowerCase();
    if (v.includes('termin')) return 'badge badge-success';
    if (v.includes('trait')) return 'badge badge-info';
    if (v.includes('attente')) return 'badge badge-warning';
    if (v.includes('annul')) return 'badge badge-danger';
    if (v.includes('soumis')) return 'badge badge-purple';
    return 'badge badge-secondary';
  }

  getPriorityBadgeClass(value: string): string {
    const v = (value || '').toLowerCase();
    if (v.includes('urgent')) return 'badge badge-danger';
    if (v.includes('régulier')) return 'badge badge-info';
    return 'badge badge-secondary';
  }

  private getDateString(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }
}