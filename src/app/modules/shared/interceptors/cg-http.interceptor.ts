import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class CgHttpInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const transformedRequest = req.clone({
      headers: req.headers
        .set('Cache-Control', 'no-store')
        .set('Pragma', 'no-cache')
    });
    return next.handle(transformedRequest);
  }
}
