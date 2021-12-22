import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameStatus } from '@main/enums/game-status.enum';
import { Mission, MissionStatus } from '@main/models/mission.model';
import { ApiService } from '@main/services/api.service';
import { Subscription } from 'rxjs';

const flyIn = [style({ transform: 'translateX(100%)' }), animate('0.5s ease-in')];
const fadeOut = [style({ opacity: '1' }), animate('0.5s ease-out', style({ opacity: '0' }))];

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0%)'})),
      transition('void => *', flyIn),
      transition('* => void', fadeOut)
    ])
  ]
})
export class MissionComponent implements OnInit, OnDestroy {

  STATUS: typeof GameStatus = GameStatus;

  missionList: Mission[];

  subscription: Subscription;

  constructor(
    public apiService: ApiService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    console.log('mission component ngOnInit');
    this.getMissionList();
  }

  ngOnDestroy(): void {
    this.snackBar.dismiss();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getMissionList(): void {
    this.subscription = this.apiService.getMissionList().subscribe({
      next: data => {
        this.missionList = data.result;
      },
      error: () => {
        const snackBarRef = this.snackBar.open('載入任務清單失敗', '重新載入', {
          panelClass: ['my-snackbar']
        });
        snackBarRef.onAction().subscribe(() => {
          this.getMissionList();
        });
      }
    })
  }

  updateMission(mission: Mission): void {
    const i = this.missionList.findIndex(m => m.missionId === mission.missionId);
    if (i !== -1) {
      this.missionList[i] = mission;
    }
  }

  getComplete(list: Mission[]): number {
    return list.filter(item => item.missionStatus !== MissionStatus.INIT).length;
  }

  getSuccess(list: Mission[]): number {
    return list.filter(item => item.missionStatus === MissionStatus.SUCCESS).length;
  }

  getFail(list: Mission[]): number {
    return list.filter(item => item.missionStatus === MissionStatus.FAIL).length;
  }

  getPending(list: Mission[]): number {
    return list.filter(item => item.missionStatus === MissionStatus.PENDING).length;
  }

  getTotalWin(list: Mission[]): number {
    return list.map(item => item.score ? item.score : 0).reduce((a , b) => a + b, 0);
  }

}
