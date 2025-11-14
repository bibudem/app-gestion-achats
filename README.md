# Application de Gestion d'Achats

Une application web pour gérer les demandes d'achats et d'abonnements des bibliothèques.

##  Fonctionnalités

- **Gestion des items** - Ajouter, modifier, consulter et supprimer
- **Liste complète** - Voir tous les items avec filtres et recherche
- **Recherche avancée** - Par titre, auteur, ISBN, etc.
- **Filtres multiples** - Par type, statut, bibliothèque
- **Gestion des budgets** - Suivi des prix et totaux
- **Multi-types** - Support pour différents types de formulaires

## Technologies Utilisées

- **Frontend**: Angular, TypeScript, Bootstrap
- **Backend**: Node.js, Express.js
- **Base de données**: PostgreSQL avec Supabase
- **Authentification**: JWT

## Installation

### Prérequis
- Angular (v20 ou plus)
- Node.js (v18 ou supérieur)
- npm ou yarn
- Compte Supabase

### 1. Cloner le projet
```bash
git clone [url-du-projet]
cd app-gestion-achats
```

### 2. Installer les dépendances
```bash
# Frontend Angular
npm install

# Backend (dans le dossier backend/)
cd backend
npm install
cd ..
```

### 3. Configuration
Créez un fichier `.env` dans le dossier `backend/` :
```env
SUPABASE_URL=votre_url_supabase
SUPABASE_KEY=votre_cle_supabase
PORT=9111
NODE_ENV=development
```

### 4. Démarrer l'application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

L'application sera accessible sur :
- Frontend: http://localhost:4200
- Backend: http://localhost:9111



## 🔧 Développement

### Structure des dossiers
```
app-gestion-achats/
├── src/app/
│   ├── components/
│   │   ├── items-list/
│   │   └── item-formulaire/
│   └── services/
     ...
├── backend/
│   ├── routes/
│   ├── controllers/
│   └── middleware/
└── README.md
```

### Commandes utiles
```bash
# Développement frontend
ng serve


```


**Version**: 1.0.0  
**Dernière mise à jour**: Novembre 2025