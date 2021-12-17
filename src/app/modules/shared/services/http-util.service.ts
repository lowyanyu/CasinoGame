import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorService } from '@cg/ng-errorhandler';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=utf-8' })
};

@Injectable()
export class HttpUtilService {

  constructor(
    private errorService: ErrorService,
    private http: HttpClient
  ) { }

  GETMethod(param: {url: string, queryParam?: any}): Observable<any> {
    let options = {};
    if (param.queryParam) {
      options = param.queryParam;
    }
    return this.http
    .get<any>(param.url, options)
    .pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

  POSTMethod(param: {url: string, body: any}): Observable<any> {
    return this.http.post<any>(param.url, param.body, httpOptions).pipe(
      map(this.errorService.handleSuccess),
      catchError(this.errorService.handleError)
    );
  }

}
