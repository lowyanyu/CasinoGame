import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Mission } from '@main/models/mission.model';
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

  missionList: Mission[];

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.getMissionList();
  }

  getMissionList(): void {
    this.apiService.getMissionList().subscribe({
      next: data => {
        this.missionList = data.missions;
      },
      error: error => {
        // TODO:
      }
    })
  }

  reload(): void {
    this.getMissionList();
  }

}
