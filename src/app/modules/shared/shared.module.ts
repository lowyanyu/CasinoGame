import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpUtilService } from './services/http-util.service';



@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    HttpUtilService
  ]
})
export class SharedModule { }
