import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgAuthGuard } from '@cg/ng-auth';
import { MaterialModule } from 'src/app/libs/material-module';

import { MainRoutingModule } from '@main/main-routing.module';
import { MainComponent } from '@main/pages/main/main.component';
import { ProfileCardComponent } from '@main/components/profile-card/profile-card.component';
import { ApiService } from '@main/services/api.service';
import { SharedModule } from '@shared/shared.module';
import { QuestionComponent } from '@main/pages/question/question.component';
import { MissionComponent } from '@main/pages/mission/mission.component';
import { QuestionCardComponent } from '@main/components/question-card/question-card.component';
import { MissionCardComponent } from '@main/components/mission-card/mission-card.component';
import { StackComponent } from './pages/stack/stack.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MenuDialogComponent } from './components/menu-dialog/menu-dialog.component';


@NgModule({
  entryComponents: [
    ConfirmDialogComponent,
    MenuDialogComponent
  ],
  declarations: [
    MainComponent,
    ProfileCardComponent,
    QuestionComponent,
    MissionComponent,
    QuestionCardComponent,
    MissionCardComponent,
    StackComponent,
    ConfirmDialogComponent,
    MenuDialogComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    MaterialModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    NgAuthGuard,
    ApiService
  ]
})
export class MainModule { }
