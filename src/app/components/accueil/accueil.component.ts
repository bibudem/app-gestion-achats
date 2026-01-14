import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomeService, DashboardStats, GraphData } from "../../services/home.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit, OnDestroy {
  // Données du dashboard avec valeurs par défaut
  dashboardStats: DashboardStats = this.getDefaultStats();
  graphData: GraphData | null = null;
  
  // États de chargement
  isLoadingDashboard = true;
  isLoadingGraphs = true;
  hasError = false;
  errorMessage = '';
  
  // Subscriptions
  private subscriptions: Subscription = new Subscription();
  
  // Sélections
  selectedPeriod = '7days';
  
  // Tableau de couleurs
  chartColors = {
    primary: '#4361ee',
    secondary: '#3a0ca3',
    success: '#4cc9f0',
    warning: '#f72585',
    info: '#7209b7',
    light: '#4895ef',
    dark: '#3f37c9',
    gray: '#adb5bd'
  };

  constructor(
    private homeService: HomeService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Charger toutes les données
  loadAllData(): void {
    this.isLoadingDashboard = true;
    this.isLoadingGraphs = true;
    this.hasError = false;

    const allDataSubscription = this.homeService.getAllHomeData().subscribe({
      next: (data) => {
        if (data.dashboard?.success && data.graph?.success) {
          this.dashboardStats = data.dashboard.data || this.getDefaultStats();
          this.graphData = data.graph.data;
          console.log('✅ Toutes les données chargées');
        } else {
          this.handleError('Erreur dans la réponse du serveur');
        }
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.handleError(err.message || 'Erreur de connexion');
      },
      complete: () => {
        this.isLoadingDashboard = false;
        this.isLoadingGraphs = false;
      }
    });

    this.subscriptions.add(allDataSubscription);
  }

  // Gérer les erreurs
  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    this.dashboardStats = this.getDefaultStats();
  }

  // Recharger les données
  refreshData(): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    this.loadAllData();
  }

  // Navigation
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  // Getters sécurisés
  get byType() {
    return this.dashboardStats.byType || [];
  }

  get topDemandeurs() {
    return this.dashboardStats.topDemandeurs || [];
  }

  get byPriority() {
    return this.dashboardStats.byPriority || [];
  }

  get totals() {
    return this.dashboardStats.totals;
  }

  // Helper methods
  formatNumber(num: number): string {
    return num?.toLocaleString('fr-CA') || '0';
  }

  calculatePercentage(part: number, total: number): number {
    return total > 0 ? Math.round((part / total) * 100) : 0;
  }

  getPriorityColor(priority: string): string {
    if (!priority) return '#6b7280';
    
    switch(priority.toLowerCase()) {
      case 'haute': return '#ef4444';
      case 'moyenne': return '#f59e0b';
      case 'basse': return '#10b981';
      default: return '#6b7280';
    }
  }

  getTypeIcon(type: string): string {
    if (!type) return '📄';
    
    switch(type) {
      case 'Nouvel achat unique': return '🛒';
      case 'Nouvel abonnement': return '📰';
      case 'Modification CCOL': return '✏️';
      case 'PEB Tipasa numérique': return '🔗';
      case 'Requête ACQ': return '❓';
      case 'Springer': return '📚';
      case 'Suggestion d\'achat': return '💡';
      default: return '📄';
    }
  }

  // Stats par défaut
  private getDefaultStats(): DashboardStats {
    return {
      totals: {
        total_items: 0,
        unique_demandeurs: 0,
        items_last_7_days: 0,
        en_traitement: 0,
        termines: 0,
        en_attente: 0
      },
      byType: [],
      byMonth: [],
      byPriority: [],
      topDemandeurs: []
    };
  }
}