import { Injectable } from '@angular/core';
import { NgAuthService } from '@cg/ng-auth';
import { NgConfigService } from '@cg/ng-config';
import { ErrorService } from '@cg/ng-errorhandler';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class LoginService {

  _loginUrl = '';

  constructor(
    private authService: NgAuthService,
    private configService: NgConfigService,
    private errorService: ErrorService,
  ) {
    const coreUrl = this.configService.get('coreUrl');
    this._loginUrl = `${coreUrl}/api/user/login`;
  }

  login(account: string, pwd: string) {
    const credential = {account: account, pwd: pwd};
    return this.authService.login(this._loginUrl, 'refresh', credential).pipe(
      map(resp => {
        return resp;
      }),
      catchError(this.errorService.handleError)
    );
  }
}
