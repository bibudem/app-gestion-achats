import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {HomeService} from "../../services/home.service";
import {Observable} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {MonographieFormulaireService} from "../../services/monographie-formulaire.service";
import {MethodesGlobal} from "../../lib/MethodesGlobal";
import {Router} from "@angular/router";



@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {

  //importer les fonctions global
  methodesGlobal: MethodesGlobal = new MethodesGlobal();


  constructor(private homeService: HomeService,
              private translate:TranslateService,
              private monographieFormulaireService: MonographieFormulaireService,
              private router: Router) {

  }

  ngOnInit(): void {

    this.creerTableauFournisseurs();


  }


//chercher la liste des fournisseurs
  async creerTableauFournisseurs() {
    try {

    } catch(err) {
      console.error(`Error : ${err.Message}`);
    }
  }

  async reload(url: string): Promise<boolean> {
    await this.router.navigateByUrl('.', { skipLocationChange: true });
    return this.router.navigateByUrl(url);
  }
}
