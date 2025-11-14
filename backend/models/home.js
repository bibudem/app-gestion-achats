const db = require('../util/database');
let SqlString = require('sqlstring'); //global declare
let datetime = require('node-datetime');

module.exports = class Logs {
  constructor() {

  }


  static async fetchCountBoard() {
    //creation de l'année
    let totalRevues=0,totalFilms=0;
    let lastDateM=''

    //afficher la requette
    /*let sql = "SELECT SUM(Total_Item_Requests) as count FROM tbl_statistiques where annee=?"
    console.log('sql: ', SqlString.format(sql,[annee]));*/

    let count1= await  db.execute('SELECT COUNT(idRevue ) as count FROM tbl_revues  ');
        if(count1[0]['0'].count)
           totalRevues=count1[0]['0'].count

    let count2= await  db.execute('SELECT COUNT(idFilm) as count FROM  tbl_films   ');
        if(count2[0]['0'].count)
          totalFilms=count2[0]['0'].count

    let lasdDateAll= await db.execute('SELECT dateM FROM `tbl_films` UNION SELECT dateM  FROM `tbl_revues` order by dateM DESC LIMIT 0,1')
        if(lasdDateAll[0]['0'].dateM)
          lastDateM=lasdDateAll[0]['0'].dateM


    let count={ 'totalRevues':totalRevues,'totalFilms':totalFilms,'lastDateM':lastDateM }

    return[count]
  }

  static async getGraphiqueDonnees() {
    //creation de l'année
    let dt = datetime.create();
    let annee = dt.format('Y')-1;
    let graphique=[]
    let i=0

    let result= await  db.execute('SELECT titre,Total_Item_Requests,Unique_Item_Requests,No_License FROM `tbl_statistiques` INNER JOIN `tbl_periodiques` on tbl_statistiques.`idRevue`=tbl_periodiques.`idRevue`  WHERE `annee`=? ORDER BY CAST(Total_Item_Requests AS UNSIGNED) DESC,CAST(citations AS UNSIGNED) DESC,CAST(articlesUdem AS UNSIGNED) DESC LIMIT 0,10',[annee]);

   while( i< 10){
      //console.log(result[0][i].titre)
      graphique[i]={'titre':result[0][i].titre,'Total_Item_Requests':result[0][i].Total_Item_Requests,'Unique_Item_Requests':result[0][i].Unique_Item_Requests,'No_License':result[0][i].No_License}
      i++
    }

    return[graphique]
  }


}
