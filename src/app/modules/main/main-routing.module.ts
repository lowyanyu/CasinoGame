import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgAuthGuard } from '@cg/ng-auth';

import { MainComponent } from '@main/pages/main/main.component';
import { QuestionComponent } from '@main/pages/question/question.component';
import { MissionComponent } from '@main/pages/mission/mission.component';
import { StakeComponent } from '@main/pages/stake/stake.component';
import { StakeHistoryComponent } from './pages/stake-history/stake-history.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [NgAuthGuard],
    canActivateChild: [NgAuthGuard],
    children: [
      {
        path: 'question',
        component: QuestionComponent
      },
      {
        path: 'mission',
        component: MissionComponent
      },
      {
        path: 'stake',
        component: StakeComponent,
        children: [
          {
            path: 'history',
            component: StakeHistoryComponent
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
