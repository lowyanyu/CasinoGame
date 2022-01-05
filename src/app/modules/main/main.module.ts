import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgAuthGuard, NgAuthInterceptor } from '@cg/ng-auth';
import { TransferErrorInterceptor } from '@cg/ng-errorhandler';
import { MaterialModule } from 'src/app/libs/material-module';
import { QRCodeModule } from 'angularx-qrcode';

import { MainRoutingModule } from '@main/main-routing.module';
import { MainComponent } from '@main/pages/main/main.component';
import { ProfileCardComponent } from '@main/components/profile-card/profile-card.component';
import { ApiService } from '@main/services/api.service';
import { QuestionComponent } from '@main/pages/question/question.component';
import { MissionComponent } from '@main/pages/mission/mission.component';
import { QuestionCardComponent } from '@main/components/question-card/question-card.component';
import { MissionCardComponent } from '@main/components/mission-card/mission-card.component';
import { StakeComponent } from '@main/pages/stake/stake.component';
import { ConfirmDialogComponent } from '@main/components/confirm-dialog/confirm-dialog.component';
import { MenuDialogComponent } from '@main/components/menu-dialog/menu-dialog.component';
import { StakeHistoryComponent } from '@main/pages/stake-history/stake-history.component';
import { GameRulesDialogComponent } from '@main/components/game-rules-dialog/game-rules-dialog.component';
import { CgHttpInterceptor } from '@shared/interceptors/cg-http.interceptor';
import { HttpUtilService } from '@shared/services/http-util.service';


@NgModule({
  entryComponents: [
    ConfirmDialogComponent,
    MenuDialogComponent,
    GameRulesDialogComponent
  ],
  declarations: [
    MainComponent,
    ProfileCardComponent,
    QuestionComponent,
    MissionComponent,
    QuestionCardComponent,
    MissionCardComponent,
    StakeComponent,
    ConfirmDialogComponent,
    MenuDialogComponent,
    StakeHistoryComponent,
    GameRulesDialogComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    MaterialModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule
  ],
  providers: [
    NgAuthGuard,
    ApiService,
    HttpUtilService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CgHttpInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NgAuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TransferErrorInterceptor,
      multi: true
    }
  ]
})
export class MainModule { }
