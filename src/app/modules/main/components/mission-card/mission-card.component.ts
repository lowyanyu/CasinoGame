import { style, animate, trigger, transition, state } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Mission, MissionStatus, MissionType } from '@main/models/mission.model';
import { ApiService } from '@main/services/api.service';

@Component({
  selector: 'app-mission-card',
  templateUrl: './mission-card.component.html',
  styleUrls: ['./mission-card.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', opacity: '0', minHeight: '0', visibility: 'hidden' })),
      state('expanded', style({ height: '*', opacity: '1', visibility: 'visible', marginBottom: '8px' })),
      transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class MissionCardComponent implements OnInit {

  MISSION_TYPE: typeof MissionType = MissionType;
  MISSION_STATUS: typeof MissionStatus = MissionStatus;

  @Input() mission: Mission;
  @Input() finished: boolean;

  @Output() updateMission = new EventEmitter<Mission>();

  inputControls: FormControl[] = [];
  uploadImages;
  reupload;

  constructor(private apiService: ApiService) {
  }

  ngOnInit(): void {
    const ctrlNum = this.mission.missionRequire.number;
    if (this.mission.missionType === MissionType.IMAGE) {
      this.uploadImages = Array(ctrlNum).fill(null);
      this.reupload = Array(ctrlNum).fill(false);
    }
    for (let i = 0; i < ctrlNum; i++) {
      if (this.mission.answer) {
        this.inputControls.push(new FormControl(this.mission.answer[i], Validators.required));
        if (this.mission.missionType === MissionType.IMAGE) {
          this.uploadImages[i] = this.mission.answer[i];
        }
      } else {
        this.inputControls.push(new FormControl('', Validators.required));
      }
      if (this.finished || !this.checkCanEdit(this.mission.missionStatus)) {
        this.inputControls[i].disable();
      }
    }
    this.mission = Object.assign({}, this.mission, {status: 'collapsed'});
    // console.log('mission card component ngOnInit:', this.mission);
    // console.log('mission is finished?', this.finished);
  }

  fileChangeEvent(fileInput: any, index: number): void {
    const fileToUpload = fileInput.target.files as Array<File>;
    const file = fileToUpload[0];
    if (file !== undefined) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let content = reader.result as string;
        if (content.length !== 0 && null != reader.result) {
          this.inputControls[index].setValue(content.split(',')[1]);
          this.uploadImages[index] = content;
        }
      };
    }
  }

  toggleMission(status: 'expanded' | 'collapsed'): void {
    this.mission = status === 'expanded' ?
        Object.assign({}, this.mission, {status: 'collapsed'}) :
        Object.assign({}, this.mission, {status: 'expanded'});
  }

  getMissionStatusDesc(mission: Mission): string {
    const completed = mission.missionStatus === MissionStatus.INIT ? '0' : mission.missionRequire.number;
    return completed + ' / ' + mission.missionRequire.number + mission.missionRequire.unit;
  }

  checkCanEdit(status: number): boolean {
    if (status === MissionStatus.INIT) {
      return true;
    }
    return false;
  }

  checkControlDisabled(): boolean {
    return this.inputControls.filter(ctrl => ctrl.disabled === true).length > 0;
  }

  checkControlInvalid(): boolean {
    return this.inputControls.filter(ctrl => ctrl.invalid === true).length > 0;
  }

  submit(mission: Mission): void {
    const values = this.inputControls.map(ctrl => ctrl.value);
    this.apiService.submitMission(values, mission).subscribe({
      next: data => {
        this.inputControls.forEach(ctrl => ctrl.disable());
        this.mission.missionStatus = data.missionStatus;
        this.mission.answer = this.mission.missionType === MissionType.IMAGE ? this.uploadImages : values;
        this.mission.score = data.score;
        this.updateMission.emit(this.mission);
      },
      error: error => {
        // TODO:
      }
    })
  }

  removeUploadImage(index: number): void {
    this.inputControls[index].setValue('');
    this.uploadImages[index] = null;
    this.hideReupload(index);
  }

  showReupload(index: number): void {
    if (this.mission.missionStatus !== MissionStatus.INIT) {
      return;
    }
    this.reupload = this.reupload.map((e, i) => {
      if (i === index) {
        return true;
      } else {
        return false;
      }
    });
  }

  hideReupload(index: number): void {
    this.reupload[index] = false;
  }
}
