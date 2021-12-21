import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MissionGameStatus } from '@main/enums/mission-game-status.enum';
import { Mission, MissionStatus } from '@main/models/mission.model';
import { ApiService } from '@main/services/api.service';

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
export class MissionComponent implements OnInit {

  STATUS: typeof MissionGameStatus = MissionGameStatus;

  missionList: Mission[];

  constructor(
    public apiService: ApiService
  ) { }

  ngOnInit(): void {
    console.log('mission component ngOnInit');
    this.getMissionList();
  }

  getMissionList(): void {
    this.apiService.getMissionList().subscribe({
      next: data => {
        this.missionList = data.result;
      },
      error: error => {
        // TODO:
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
