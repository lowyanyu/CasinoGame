import { style, animate, trigger, transition, state } from '@angular/animations';
import { AfterViewInit, Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Mission, MissionStatus, MissionType } from '@main/models/mission.model';

const swipe = [style({ transform: 'translateX(100%)' }), animate('.5s ease-out', style({ transform: 'translateX(0%)' }))];
const fade = [style({ opacity: '0' }), animate('500ms', style({ opacity: '1' }))];

@Component({
  selector: 'app-mission-card',
  templateUrl: './mission-card.component.html',
  styleUrls: ['./mission-card.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: 'auto', visibility: 'visible', marginBottom: '8px' })),
      // transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class MissionCardComponent implements OnInit {

  MISSION_TYPE: typeof MissionType = MissionType;
  MISSION_STATUS: typeof MissionStatus = MissionStatus;

  @Input() mission: Mission;
  @Input() finished: boolean;

  inputControl: FormControl[] = [];

  constructor() {
  }

  ngOnInit(): void {
    const ctrlNum = this.mission.missionRequire.number;
    for (let i = 0; i < ctrlNum; i++) {
      if (this.mission.answer) {
        this.inputControl.push(new FormControl(this.mission.answer[i], Validators.required));
      } else {
        this.inputControl.push(new FormControl('', Validators.required));
      }
      if (this.finished || this.checkSuccess(this.mission.missionStatus)) {
        this.inputControl[i].disable();
      }
    }
    this.mission = Object.assign({}, this.mission, {status: 'collapsed'});
    console.log('mission card component ngOnInit:', this.mission);
    console.log('mission is finished?', this.finished);
  }

  toggleMission(status: 'expanded' | 'collapsed'): void {
    this.mission = status === 'expanded' ?
        Object.assign({}, this.mission, {status: 'collapsed'}) :
        Object.assign({}, this.mission, {status: 'expanded'});
    console.log('toggle mission to ' + this.mission['status']);
  }

  getMissionStatusDesc(mission: Mission): string {
    const completed = mission.missionStatus === MissionStatus.INIT ? '0' : mission.missionRequire.number;
    return completed + ' / ' + mission.missionRequire.number + mission.missionRequire.unit;
  }

  checkSuccess(status: number): boolean {
    if (status === MissionStatus.SUCCESS) {
      return true;
    }
    return false;
  }
}
