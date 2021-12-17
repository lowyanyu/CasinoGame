import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TransferErrorInterceptor } from '@cg/ng-errorhandler';
import { MaterialModule } from 'src/app/libs/material-module';

import { HomeRoutingModule } from '@home/home-routing.module';
import { HomeComponent } from '@home/pages/home/home.component';
import { LoginComponent } from '@home/pages/login/login.component';
import { LoginService } from '@home/services/login.service';


@NgModule({
  declarations: [HomeComponent, LoginComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    LoginService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TransferErrorInterceptor,
      multi: true
    }
  ]
})
export class HomeModule { }
