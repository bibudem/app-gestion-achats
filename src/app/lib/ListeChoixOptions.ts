//class qui regroupes les liste de choix pour differents champs
export class ListeChoixOptions  {

  //les options pour le select
  listPlateformesObj = [];

  //options type
  listType = [
    { id: 1, name: "Online Book" },
    { id: 2, name: "E Major Reference Work" }
  ];

  //options Statut
  listCategorie = [
    { id: 1, name: "Abonnement" },
    { id: 2, name: "Achat unique" },
    { id: 3, name: "Frais de mise à jour" }
  ];
  //options programmes
  listProgramme = [
    { id: 1, name: "EBA - Achat sectoriel (Add On)" },
    { id: 2, name: "BCI" },
    { id: 3, name: "EBA" },
    { id: 4, name: "Donnée non disponible" }
  ];
  //options bibliotheques
  listBibliotheques = [
    { id: 1, name: "Aménagement" },
    { id: 2, name: "BLSH" },
    { id: 3, name: "BSLH" },
    { id: 4, name: "Kinésiologie" },
    { id: 5, name: "Médecine vétérinaire" },
    { id: 6, name: "Santé" },
    { id: 7, name: "Sciences" },
    { id: 7, name: "Non applicable" }
  ];
  //options SECTEUR
  listSecteurs = [
    { id: 1, name: "LSH" },
    { id: 2, name: "Sciences & Santé" },
    { id: 3, name: "TGDAMLD" },
    { id: 4, name: "Donnée non disponible" }
  ];
  //objet pour les sujets
  sujetsListe = [
    {id: 1, name: 'sujet 1'},
    {id: 2, name: 'sujet 2'},
    {id: 3, name: 'sujet 3'},
    {id: 8, name: 'sujet 4'},
  ];
  //objet pour les sujets
  listeAcces = [
    {id: 1, name: 'Oui'},
    {id: 2, name: 'Non'},
    {id: 3, name: 'Hybride'},
  ];

  //objet pour les sujets
  essentiel = [
    {id: 1, name: 'Oui'},
    {id: 2, name: 'Non'}
  ];

  //objet pour les sujets
  listeFonds = [
    {id: 1, name: 'MO 002'},
    {id: 2, name: 'MO 012'},
    {id: 3, name: 'MO 030'},
    {id: 4, name: 'MO 032'},
    {id: 5, name: 'MO 051'},
    {id: 6, name: 'MO 071'},
    {id: 7, name: 'MO 032'},
    {id: 8, name: 'MO 033'},
    {id: 9, name: 'MO 035'},
    {id: 10, name: 'Non disponible'}
  ];


  //objet pour les sujets
  listeLangue = [
    {id: 1, name: 'Français'},
    {id: 2, name: 'Anglais'},
    {id: 3, name: 'Espagnol'},
    {id: 4, name: 'Autres'}
  ];

  //objet pour les sujets
  listeNbrUsager = [
    {id: 1, name: '1'},
    {id: 2, name: '2'},
    {id: 3, name: '3'},
    {id: 4, name: '4'},
    {id: 5, name: '5'},
    {id: 6, name: 'illimités'}
  ];
  //options Format
  listFormat = [
    { id: 1, name: "Électronique" },
    { id: 2, name: "Papier" },
    { id: 3, name: "Élect. + Papier" }
  ];
}
