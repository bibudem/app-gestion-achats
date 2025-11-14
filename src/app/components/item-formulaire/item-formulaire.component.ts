import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item, ItemFormulaireService } from '../../services/items-formulaire.service';

@Component({
  selector: 'app-item-formulaire',
  templateUrl: './item-formulaire.component.html',
  styleUrls: ['./item-formulaire.component.css']
})
export class ItemFormulaireComponent implements OnInit {
  itemForm: FormGroup;
  itemId: number | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;

  // Options pour les selects
  typeOptions = [
    { value: 'nouvel_achat_unique', label: 'Nouvel achat unique' },
    { value: 'modification_ccol', label: 'Modification CCOL' },
    { value: 'nouvel_abonnement', label: 'Nouvel abonnement' },
    { value: 'springer', label: 'Springer' },
    { value: 'peb_tipasa', label: 'PEB Tipasa' },
    { value: 'suggestion_usagers', label: 'Suggestion usagers' },
    { value: 'requete_accessibilite', label: 'Requête accessibilité' }
  ];

  statusOptions = [
    { value: 'En attente', label: 'En attente' },
    { value: 'En cours', label: 'En cours' },
    { value: 'Complété', label: 'Complété' },
    { value: 'Annulé', label: 'Annulé' }
  ];

  prioriteOptions = [
    { value: 'Urgente', label: 'Urgente' },
    { value: 'Élevée', label: 'Élevée' },
    { value: 'Normale', label: 'Normale' },
    { value: 'Basse', label: 'Basse' }
  ];

  bibliothequeOptions = [
    'Bibliothèque centrale',
    'Bibliothèque des sciences',
    'Bibliothèque des sciences humaines',
    'Bibliothèque de droit',
    'Bibliothèque de médecine',
    'Bibliothèque de musique'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private itemService: ItemFormulaireService
  ) {
    this.itemForm = this.createForm();
  }

  ngOnInit(): void {
    this.itemId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.itemId;

    if (this.isEditMode) {
      this.loadItem();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Informations de base
      type_formulaire: ['', Validators.required],
      priorite_demande: ['Normale'],
      projets_speciaux: [''],
      
      // Informations du document
      titre_document: ['', [Validators.required, Validators.maxLength(500)]],
      sous_titre: ['', Validators.maxLength(500)],
      isbn_issn: [''],
      editeur_document: [''],
      date_publication: [''],
      auteur: ['', Validators.maxLength(500)],
      
      // Catalogage
      creation_notice_dtdm: [false],
      note_dtdm: [''],
      numero_oclc_existant: [''],
      catalogage: [''],
      note_catalogueur: [''],
      
      // Période et couverture
      periode_couverte: [''],
      date_debut_abonnement: [''],
      nombre_titres_inclus: [''],
      
      // Source
      source_information: [''],
      lien_plateforme: [''],
      id_ressource: [''],
      collection: [''],
      
      // Catégorisation
      categorie_document: [''],
      type_monographie: [''],
      format_support: [''],
      categorie_depense: [''],
      
      // Format électronique
      pret_numerique_format: [''],
      plateforme_privilegier: [''],
      
      // Accès
      nombre_utilisateurs: [''],
      
      // Localisation
      bibliotheque: [''],
      localisation_emplacement: [''],
      
      // Budget
      fonds_budgetaire: [''],
      fonds_sn_projet: [''],
      quantite: [1, [Validators.min(1)]],
      prix_cad: [0, [Validators.min(0)]],
      devise_originale: ['CAD'],
      prix_devise_originale: [0, [Validators.min(0)]],
      
      // Personnes
      bib_nom_demandeur: [''],
      bib_personne_aviser: [''],
      usager_aviser_reservation: [''],
      usager_aviser_activation: [''],
      
      // Réserve de cours
      reserve_cours: [false],
      reserve_cours_sigle: [''],
      reserve_cours_session: [''],
      reserve_cours_enseignant: [''],
      reserve_cours_mise_a_reserve: [''],
      enseignants_requis_pour_cours: [''],
      
      // Notes
      bib_note_commentaire: [''],
      usager_notes_commentaires: [''],
      
      // Statuts
      bib_statut_demande: ['En attente'],
      dircol_acq_statut_demande: [''],
      dircol_acq_suivi_demande: [''],
      dircol_acq_note: [''],
      dircol_acq_bordereau_imprime: [''],
      accessibilite_statut_demande: [''],
      
      // Précision
      precision_demande: [''],
      
      // PEB-Tipasa
      reference_usager_tipasa: [''],
      vu_format_numerique_oasis: [''],
      version_moins_365_usd: [''],
      dircol_acq_responsable: [''],
      
      // Suggestion usagers
      usager_nom: [''],
      usager_categorie: [''],
      usager_faculte_dept: [''],
      usager_courriel: [''],
      usager_bibliotheque: [''],
      bibliothecaire_disciplinaire: [''],
      usager_aviser_document_recu: [false],
      acq_isbn: [''],
      dircol_acq_raison_annulation: [''],
      techdoc_tri_suggestion_transmise: [false],
      techdoc_tri_notes: [''],
      suivi_reservation_arrivee: [''],
      enseignants_mettre_reserve: [''],
      
      // Accessibilité
      accessibilite_nom_demandeur: [''],
      besoin_specifique_format: [''],
      exemplaire_electronique_detenu: [''],
      exemplaire_papier_detenu: [''],
      fonds_budgetaire_si_achat: [''],
      fournisseur_contacte_sans_succes: [false],
      isbn_document: [''],
      localisation: [''],
      no_notice_oclc: [null],
      permalien_sofia: [''],
      reference_usager: [''],
      reserver_pour_usager: [''],
      si_electronique_nb_utilisateurs: [''],
      si_electronique_lien: [''],
      si_electronique_nb_usagers: [''],
      source_info_editeur: [''],
      verification_caeb: [''],
      verification_emma: [''],
      verification_sqla: [''],
      dircol_acq_date_demande_editeur: [''],
      dircol_acq_date_livraison_estimee: [''],
      dircol_acq_numerisation_recommandee: [false]
    });
  }

  loadItem(): void {
    if (!this.itemId) return;

    this.loading = true;
    this.itemService.consulter(this.itemId).subscribe({
      next: (item) => {
        this.itemForm.patchValue(item);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.submitting = true;
    const formData = this.itemForm.value;

    if (this.isEditMode && this.itemId) {
      // Modification
      const updateData = { ...formData, id_item: this.itemId };
      this.itemService.update(updateData).subscribe({
        next: () => {
          this.submitting = false;
          alert('Item modifié avec succès!');
          this.router.navigate(['/items']);
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          this.submitting = false;
        }
      });
    } else {
      // Création
      this.itemService.post(formData).subscribe({
        next: () => {
          this.submitting = false;
          alert('Item créé avec succès!');
          this.router.navigate(['/items']);
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    if (confirm('Voulez-vous vraiment annuler ? Les modifications non sauvegardées seront perdues.')) {
      this.router.navigate(['/items']);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.itemForm.controls).forEach(key => {
      const control = this.itemForm.get(key);
      control?.markAsTouched();
    });
  }

  // Helper pour afficher les erreurs de validation
  hasError(controlName: string, errorType: string): boolean {
    const control = this.itemForm.get(controlName);
    return control ? control.hasError(errorType) && (control.touched || control.dirty) : false;
  }

  // Calculer le total
  calculateTotal(): number {
    const quantite = this.itemForm.get('quantite')?.value || 0;
    const prix = this.itemForm.get('prix_cad')?.value || 0;
    return quantite * prix;
  }
}