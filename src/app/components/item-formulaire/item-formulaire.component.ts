import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item, ItemFormulaireService } from '../../services/items-formulaire.service';
import { ListeChoixOptions } from '../../lib/ListeChoixOptions';

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
    console.log(this.itemId)
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Informations de base
      formulaire_id: [null],
      date_creation: [''],
      priorite_demande: ['Régulier'],
      projet_special: ['Ne s\'applique pas'],
      
      // Informations du document
      titre_document: ['', [Validators.required, Validators.maxLength(500)]],
      sous_titre: ['', Validators.maxLength(500)],
      isbn_issn: ['', Validators.maxLength(50)],
      editeur: ['', Validators.maxLength(300)],
      date_publication: ['', Validators.maxLength(50)],
      
      // Catalogage
      creation_notice_dtdm: [false],
      note_dtdm: [''],
      
      // Catégorisation
      categorie_document: [''],
      format_support: [''],
      
      // Informations financières
      fonds_budgetaire: ['', Validators.maxLength(200)],
      fonds_sn_projet: ['', Validators.maxLength(100)],
      
      // Bibliothèque
      bibliotheque: [''],
      localisation_emplacement: ['', Validators.maxLength(200)],
      
      // Personnes concernées
      demandeur: ['', Validators.maxLength(200)],
      personne_a_aviser_activation: ['', Validators.maxLength(200)],
      
      // Source d'information
      source_information: ['', Validators.maxLength(500)],
      
      // Notes et commentaires
      note_commentaire: [''],
      
      // Identifiants
      id_ressource: ['', Validators.maxLength(100)],
      catalogue: ['', Validators.maxLength(200)],
      
      // Statuts
      statut_bibliotheque: ['En attente en bibliothèque'],
      statut_acq: [''],
      
      // Métadonnées (lecture seule)
      date_modification: [{ value: '', disabled: true }],
      utilisateur_modification: [{ value: '', disabled: true }]
    });
  }

  loadItem(): void {
    if (!this.itemId) return;

    this.loading = true;
    this.itemService.consulter(this.itemId).subscribe({
      next: (item) => {
        this.itemForm.patchValue(item.data);
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

    // Ajouter la date de modification
    formData.date_modification = new Date().toISOString();

    if (this.isEditMode && this.itemId) {
      const updateData = { ...formData, item_id: this.itemId };
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
}