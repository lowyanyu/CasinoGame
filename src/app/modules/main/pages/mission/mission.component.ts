import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MissionGameStatus } from '@main/enums/mission-game-status.enum';
import { Mission, MissionStatus } from '@main/models/mission.model';
import { ApiService } from '@main/services/api.service';

@Component({
  selector: 'app-mission',
  templateUrl: './mission.component.html',
  styleUrls: ['./mission.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0%)'})),
      transition('void => *', [
        style({
          transform: 'translateX(100%)'
        }),
        animate('0.5s ease-in')
      ]),
      transition('* => void', [
        animate('0.5s 0.1s ease-out', style({
          transform: 'translateX(0%)'
        }))
      ])
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

  reload(): void {
    this.getMissionList();
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
    const success = list.filter(item => item.missionStatus === MissionStatus.SUCCESS);
    return success.map(item => item.missionReward).reduce((a , b) => a + b, 0);
  }

}
