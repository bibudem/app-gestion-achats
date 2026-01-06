import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item, ItemFormulaireService } from '../../services/items-formulaire.service';
import { ListeChoixOptions } from '../../lib/ListeChoixOptions';

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css']
})
export class ItemsListComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  loading = false;
  searchTerm = '';
  selectedBibliotheque = '';
  selectedStatutBibliotheque = '';
  selectedStatutAcq = '';


   statutBadgeMap: Record<string, string> = {
    'En attente': 'bg-info',
    'Complété': 'bg-success',
    'Demande annulée': 'bg-danger',
    'Budget atteint': 'bg-warning',
    'En attente de traitement': 'bg-secondary',
    'En cours': 'bg-primary'
  };

  options = new ListeChoixOptions();

  constructor(private itemService: ItemFormulaireService, private router: Router) {}

  ngOnInit(): void {
    this.loadItems();
  }

loadItems(): void {
  this.loading = true;
  console.log('📞 Chargement des items...');

  this.itemService.getAll().subscribe({
    next: (data: unknown) => {
      console.log('📦 Données brutes reçues depuis le service :', data);

      // Normaliser les données pour s'assurer que c'est bien un tableau
      const normalized = this.normalizeItems(data);
      console.log('🔄 Données après normalisation :', normalized);

      this.items = normalized;
      this.applyFilters();

      console.log('✅ Items chargés pour affichage :', this.items);
      this.loading = false;
    },
    error: (err) => {
      console.error('❌ Erreur chargement items', err);
      this.items = [];
      this.filteredItems = [];
      this.loading = false;
    }
  });
}

private normalizeItems(data: any): Item[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    // si le tableau est dans la propriété "data"
    if (Array.isArray(data.data)) {
      console.log('✅ Tableau trouvé dans data.data');
      return data.data;
    }

    // sinon on essaye Object.values (optionnel)
    const values = Object.values(data);
    const items = values.filter(
      (val: any) =>
        val && typeof val === 'object' && (val.titre_document || val.item_id)
    );
    return items as Item[];
  }

  return [];
}


  // Applique tous les filtres et recherche
 applyFilters(): void {
  this.filteredItems = this.items.filter(item => {
    const matchesSearch = this.searchTerm
      ? (item.titre_document?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         item.isbn_issn?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         item.demandeur?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
         item.editeur?.toLowerCase().includes(this.searchTerm.toLowerCase()))
      : true;

    const matchesBib =
      this.selectedBibliotheque
        ? item.bibliotheque === this.selectedBibliotheque
        : true;

    const matchesStatutBib =
      this.selectedStatutBibliotheque
        ? item.statut_bibliotheque === this.selectedStatutBibliotheque
        : true;

    const matchesStatutAcq =
      this.selectedStatutAcq
        ? item.statut_acq === this.selectedStatutAcq
        : true;

    return matchesSearch && matchesBib && matchesStatutBib && matchesStatutAcq;
  });
}


  onSearch(): void { this.applyFilters(); }
  onBibliothequeChange(): void { this.applyFilters(); }
  onStatusChange(): void { this.applyFilters(); }

 resetFilters(): void {
  this.searchTerm = '';
  this.selectedBibliotheque = '';
  this.selectedStatutBibliotheque = '';
  this.selectedStatutAcq = '';
  this.applyFilters();
}


  deleteItem(id?: number): void {
    if (!id) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet item ?')) return;

    this.itemService.delete(id).subscribe({
      next: () => {
        this.items = this.items.filter(item => item.item_id !== id);
        this.applyFilters();
        alert('Item supprimé avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression de l\'item');
      }
    });
  }

  viewItem(id?: number): void {
    if (!id) return;
    this.router.navigate(['/items', id]);
  }

  trackByItemId(index: number, item: Item): number {
    return item.item_id || index;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'Non spécifié';
    try {
      return new Date(dateString).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  }

  getStatusBadgeClass(status?: string): string {
    if (!status) return 'badge bg-light text-dark';
    if (status.includes('Saisie en cours')) return 'badge bg-warning';
    if (status.includes('En attente')) return 'badge bg-info';
    if (status.includes('Soumis aux ACQ') || status.includes('Complété')) return 'badge bg-success';
    if (status.includes('Demande annulée')) return 'badge bg-danger';
    if (status.includes('Budget atteint')) return 'badge bg-secondary';
    return 'badge bg-light text-dark';
  }

  getStatusText(status?: string): string {
    if (!status) return 'Non spécifié';
    if (status.includes('Saisie en cours')) return 'Saisie en cours';
    if (status.includes('En attente')) return 'En attente';
    if (status.includes('Soumis aux ACQ')) return 'Soumis ACQ';
    if (status.includes('Complété')) return 'Complété';
    if (status.includes('Demande annulée')) return 'Annulé';
    if (status.includes('Budget atteint')) return 'Budget atteint';
    return status;
  }

  getDocumentCategory(category?: string): string {
    if (!category) return '';
    const abbreviations: { [key: string]: string } = {
      'Monographie': 'MONO',
      'Périodique': 'PERIO',
      'Base de données': 'BD',
      'Archives de périodiques': 'ARCH_PER',
      'Archives de monographies': 'ARCH_MONO'
    };
    return abbreviations[category] || category.substring(0, 4).toUpperCase();
  }

  getFormatSupport(format?: string): string {
    if (!format) return '';
    return format === 'Imprimé/support physique' ? 'Imprimé'
         : format === 'Électronique' ? 'Électronique'
         : format;
  }

  getStatutsUniques(): string[] {
    return [
      ...new Set(
        this.filteredItems
          .map(item => item.statut_bibliotheque)
          .filter((statut): statut is string => Boolean(statut))
      )
    ];
}
}
