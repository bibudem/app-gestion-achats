import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";


@Injectable({
  providedIn: "root",
})
export class MonographieFormulaireService {
  [x: string]: any;
  private url = "/api/monographie";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}


//chercher toute la liste
  fetchAll(): Observable<any[]> {
    return this.http
      .get<any[]>(this.url+'/all', { responseType: "json" })
      .pipe(
        tap((_) => console.log("fetched monographies")),
        catchError(
          this.errorHandlerService.handleError<any[]>("fetchAll", [])
        )
      );
  }

  //chercher toute la liste
  fetchAllFournissuers(): Observable<any[]> {
    return this.http
      .get<any[]>(this.url+'/all/fournisseurs', { responseType: "json" })
      .pipe(
        tap((_) => console.log("fetched fournisseurs")),
        catchError(
          this.errorHandlerService.handleError<any[]>("fetchAllFournissuers", [])
        )
      );
  }
}
