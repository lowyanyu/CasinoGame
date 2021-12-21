import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgAuthGuard } from '@cg/ng-auth';

import { MainComponent } from '@main/pages/main/main.component';
import { QuestionComponent } from '@main/pages/question/question.component';
import { MissionComponent } from '@main/pages/mission/mission.component';
import { StackComponent } from '@main/pages/stack/stack.component';

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
        path: 'stack',
        component: StackComponent
      }
    ]
  },
  { path: '**', redirectTo: 'main', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
