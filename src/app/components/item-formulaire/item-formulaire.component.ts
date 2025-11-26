import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item, ItemFormulaireService } from '../../services/items-formulaire.service';
import { ListeChoixOptions } from '../../lib/ListeChoixOptions';

@Component({
  selector: 'app-item-formulaire',
  templateUrl: './item-formulaire.component.html',
  styleUrls: ['./item-formulaire.component.css']
})
export class ItemFormulaireComponent implements OnInit, AfterViewInit {
  itemForm: FormGroup;
  itemId: number | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;

  // Instance de la classe contenant les options
  options = new ListeChoixOptions();

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

  // Les autres méthodes restent inchangées...
  ngAfterViewInit() {
    this.initializeBootstrapTabs();
  }

  private initializeBootstrapTabs() {
    setTimeout(() => {
      const tabElements = document.querySelectorAll('a[data-bs-toggle="tab"]');
      
      tabElements.forEach(tabElement => {
        tabElement.addEventListener('click', (event: Event) => {
          event.preventDefault();
          const target = (event.target as HTMLAnchorElement).getAttribute('href');
          if (target) {
            this.showTab(target);
          }
        });
      });
    }, 100);
  }

  private showTab(tabId: string) {
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
      pane.classList.remove('show', 'active');
    });

    const tabLinks = document.querySelectorAll('.nav-link');
    tabLinks.forEach(link => {
      link.classList.remove('active');
    });

    const targetPane = document.querySelector(tabId);
    const targetLink = document.querySelector(`a[href="${tabId}"]`);
    
    if (targetPane && targetLink) {
      targetPane.classList.add('show', 'active');
      targetLink.classList.add('active');
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Informations de base
      type_formulaire: ['', Validators.required],
      priorite_demande: ['Régulier'],
      projets_speciaux: [''],
      
      // Informations du document
      titre_document: ['', [Validators.required, Validators.maxLength(500)]],
      sous_titre: ['', Validators.maxLength(500)],
      isbn_issn: [''],
      editeur_document: [''],
      date_publication: [''],
      auteur: ['', Validators.maxLength(500)],
      
      // Catalogage
      creation_notice_dtdm: [''],
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
      bib_statut_demande: ['En attente en bibliothèque'],
      dircol_acq_statut_demande: [''],
      dircol_acq_suivi_demande: [''],
      dircol_acq_note: [''],
      dircol_acq_bordereau_imprime: [''],
      accessibilite_statut_demande: [''],
      
      // Champs calculés (lecture seule)
      demande_calculee: [{ value: '', disabled: true }],
      demande_statut_calculee: [{ value: '', disabled: true }],
      filtre_calculee: [{ value: '', disabled: true }],
      
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
    const formData = this.itemForm.getRawValue();

    if (this.isEditMode && this.itemId) {
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

  hasError(controlName: string, errorType: string): boolean {
    const control = this.itemForm.get(controlName);
    return control ? control.hasError(errorType) && (control.touched || control.dirty) : false;
  }

  calculateTotal(): number {
    const quantite = this.itemForm.get('quantite')?.value || 0;
    const prix = this.itemForm.get('prix_cad')?.value || 0;
    return quantite * prix;
  }
}