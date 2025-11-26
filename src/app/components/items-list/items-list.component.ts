import { Component, OnInit } from '@angular/core';
import { Item, ItemFormulaireService } from '../../services/items-formulaire.service';
import { Router } from '@angular/router';

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
  selectedType = '';
  selectedStatus = '';

  // Options pour les filtres
  typeOptions = [
    'nouvel_achat_unique',
    'modification_ccol',
    'nouvel_abonnement', 
    'springer',
    'peb_tipasa',
    'suggestion_usagers',
    'requete_accessibilite'
  ];

  statusOptions = [
    'En attente',
    'En cours',
    'Complété',
    'Annulé'
  ];

  constructor(private itemService: ItemFormulaireService, private router: Router) { }

  ngOnInit(): void {
    this.loadItems();
  }

  // Charger tous les items
  loadItems(): void {
    this.loading = true;
    this.itemService.getAll().subscribe({
      next: (items) => {
        this.items = items;
        this.filteredItems = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des items:', error);
        this.loading = false;
      }
    });
  }

  // Recherche d'items
  onSearch(): void {
    if (this.searchTerm.trim()) {
      this.itemService.search(this.searchTerm).subscribe({
        next: (items) => {
          this.filteredItems = items;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche:', error);
        }
      });
    } else {
      this.filteredItems = this.items;
    }
  }

  // Filtrer par type
  onTypeChange(): void {
    if (this.selectedType) {
      this.itemService.getByType(this.selectedType).subscribe({
        next: (items) => {
          this.filteredItems = items;
        },
        error: (error) => {
          console.error('Erreur lors du filtrage par type:', error);
        }
      });
    } else {
      this.filteredItems = this.items;
    }
  }

  // Filtrer par statut
  onStatusChange(): void {
    if (this.selectedStatus) {
      this.itemService.getByStatus(this.selectedStatus).subscribe({
        next: (items) => {
          this.filteredItems = items;
        },
        error: (error) => {
          console.error('Erreur lors du filtrage par statut:', error);
        }
      });
    } else {
      this.filteredItems = this.items;
    }
  }

  // Réinitialiser les filtres
  resetFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
    this.filteredItems = this.items;
  }

  // Supprimer un item
  deleteItem(id: number | undefined): void {
    if (!id) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet item ?')) {
      this.itemService.delete(id).subscribe({
        next: () => {
          this.items = this.items.filter(item => item.id_item !== id);
          this.filteredItems = this.filteredItems.filter(item => item.id_item !== id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  // Consulter un item
  viewItem(id: number | undefined): void {
    if (!id) return;
    
    this.itemService.consulter(id).subscribe({
      next: (item) => {
        // Rediriger vers la page de détail ou ouvrir un modal
        //console.log('Item consulté:', item);
        this.router.navigate(['/items', id]);
      },
      error: (error) => {
        console.error('Erreur lors de la consultation:', error);
      }
    });
  }

  // Formater le prix
  formatPrice(price: number | undefined): string {
    return price ? `$${price.toFixed(2)}` : 'Non spécifié';
  }

  // Formater la date
  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-CA');
  }

  // CORRECTION : Gérer les valeurs undefined
  getStatusBadgeClass(status: string | undefined): string {
    const actualStatus = status || 'En attente';
    
    switch (actualStatus) {
      case 'En attente':
        return 'badge status-pending';
      case 'En cours':
        return 'badge status-in-progress';
      case 'Complété':
        return 'badge status-completed';
      case 'Annulé':
        return 'badge status-cancelled';
      default:
        return 'badge bg-warning';
    }
  }

  // Méthode pour obtenir le texte du statut
  getStatusText(status: string | undefined): string {
    return status || 'En attente';
  }
}