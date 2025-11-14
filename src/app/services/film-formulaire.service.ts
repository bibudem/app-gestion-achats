import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";

import {Film} from "../models/Film";


@Injectable({
  providedIn: "root",
})
export class FilmFormulaireService {
  [x: string]: any;
  private url = "/api/film";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}

  post(film: any): Observable<any> {
    return this.http
      .post<any>(this.url+'/add', film, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("post")));
  }

  update(film: Film): Observable<any> {
    //console.log(revue);
    return this.http
      .put<Film>(this.url+'/save', film, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("update")));
  }

  delete(id: number): Observable<any> {
    const url = this.url+`/delete/${id}`;

    return this.http
      .delete<Film>(url, this.httpOptions)
      .pipe(catchError(this.errorHandlerService.handleError<any>("delete")));
  }
  consulter(id: number): Observable<any> {
    console.log(id);
    const url = this.url+`/fiche/${id}`;
    console.log(url);
    return this.http
      .get<Film>(url, { responseType: "json" })
      .pipe(catchError(this.errorHandlerService.handleError<any>("consulter")));

  }

}
