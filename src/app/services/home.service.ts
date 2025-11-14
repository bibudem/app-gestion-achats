import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";

import { ErrorHandlerService } from "./error-handler.service";


@Injectable({
  providedIn: "root",
})
export class HomeService {
  [x: string]: any;
  private url = "/api/home";

  httpOptions: { headers: HttpHeaders } = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
  };

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private http: HttpClient
  ) {}

  //chercher le total des logs
  getCount(): Observable<any[]> {
    //console.log(this.url+'/count')
    return this.http
      .get<any[]>(this.url+'/count', { responseType: "json" })
      .pipe(
        tap((_) => console.log("total données")),
        catchError(
          this.errorHandlerService.handleError<any[]>("getCount", [])
        )
      );
  }


}
