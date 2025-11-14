import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import {Pret} from "../models/Pret";


@Injectable({
  providedIn: "root",
})
export class PretFormulaireService {
  [x: string]: any;
  private url = "/api/pret";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}

  post(pret: Pret): Observable<any> {
    return this.http
      .post<Partial<Pret>>(this.url+'/add', pret, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  update(pret: Pret): Observable<any> {
    return this.http
      .put<Pret>(this.url+'/save', pret, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  delete(id: number): Observable<any> {
    const url = this.url+`/delete/${id}`;

    return this.http
      .delete<Pret>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  consulter(id: number): Observable<any> {
    //console.log(id);
    const url = this.url+`/fiche/${id}`;
    return this.http
      .get<Pret>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter")));
  }

}
