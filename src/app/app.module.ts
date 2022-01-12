import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgAuthInterceptor, NgAuthModule, NgAuthService } from '@cg/ng-auth';
import { NgConfigModule } from '@cg/ng-config';
import { ErrorService, TransferErrorInterceptor } from '@cg/ng-errorhandler';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ForbiddenComponent } from './pages/forbidden/forbidden.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { MaterialModule } from './libs/material-module';

@NgModule({
  declarations: [
    AppComponent,
    ForbiddenComponent,
    UnauthorizedComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    NgConfigModule,
    NgAuthModule,
    MaterialModule
  ],
  providers: [
    ErrorService,
    NgAuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TransferErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
