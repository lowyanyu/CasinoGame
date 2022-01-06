import { style, animate, trigger, transition, state } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
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

  @ViewChild('exImgRef') example: TemplateRef<any>;

  MISSION_TYPE: typeof MissionType = MissionType;
  MISSION_STATUS: typeof MissionStatus = MissionStatus;

  @Input() mission: Mission;
  @Input() finished: boolean;

  @Output() updateMission = new EventEmitter<Mission>();

  imageControls: FormControl[] = [];
  inputControl: FormControl;
  uploadImages;
  reupload;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) {
  }

  ngOnInit(): void {
    const ctrlNum = this.mission.missionRequire.number;
    if (this.mission.missionType === MissionType.IMAGE) {
      this.uploadImages = Array(ctrlNum).fill(null);
      this.reupload = Array(ctrlNum).fill(false);
      for (let i = 0; i < ctrlNum; i++) {
        if (this.mission.answer) {
          this.imageControls.push(new FormControl(this.mission.answer[i], Validators.required));
          this.uploadImages[i] = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + this.mission.answer[i]);
        } else {
          this.imageControls.push(new FormControl('', Validators.required));
        }
        if (this.finished || !this.checkCanEdit(this.mission.missionStatus)) {
          this.imageControls[i].disable();
        }
      }
    } else {
      this.inputControl = new FormControl('', Validators.required);
      if (this.mission.answer) {
        this.inputControl.setValue(this.mission.answer);
      }
      if (this.finished || !this.checkCanEdit(this.mission.missionStatus)) {
        this.inputControl.disable();
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
      if (!(file.type.includes('jpeg') || file.type.includes('jpg') || file.type.includes('png'))) {
        this.snackBar.open(`僅允許.jpg .jpeg .png檔案，請重新上傳！`, '知道了', {
          duration: 2000,
          panelClass: 'my-snackbar'
        });
        return;
      }
      let reader = new FileReader();
      reader.readAsDataURL(file);
      // alert("before compress img size: " + file.size);
      const THIS = this;
      reader.onload = () => {
        const img = new Image();
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          const MAX_WIDTH = width > 2500 ? width / 2 : 2500;
          const MAX_HEIGHT = height > 2500 ? height / 2 : 2500;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          let dataURL = canvas.toDataURL('image/jpeg', 1);
          let blob = THIS.dataURItoBlob(dataURL);

          // set image quality depends on size
          if (blob.size > 2000 * 1024) {
            dataURL = canvas.toDataURL('image/jpeg', .2);
          } else if (blob.size > 1000 * 1024) {
            dataURL = canvas.toDataURL('image/jpeg', .5);
          } else {
            dataURL = canvas.toDataURL('image/jpeg', .8);
          }

          blob = THIS.dataURItoBlob(dataURL);
          let imgSrc = THIS.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
          // alert("after compress img size: " + blob.size);
          THIS.imageControls[index].setValue(dataURL.split(',')[1]);
          THIS.uploadImages[index] = imgSrc;
        }
        img.src = URL.createObjectURL(file);
      }
    }
  }

  dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
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

  checkControlsDisabled(): boolean {
    return this.imageControls.filter(ctrl => ctrl.disabled === true).length > 0;
  }

  checkControlsInvalid(): boolean {
    return this.imageControls.filter(ctrl => ctrl.invalid === true).length > 0;
  }

  submit(mission: Mission): void {
    if (mission.missionType === MissionType.IMAGE) {
      const answer: string[] = this.imageControls.map(ctrl => ctrl.value);
      this.mission.missionStatus = MissionStatus.IMG_UPLOADING;
      this.imageControls.forEach(ctrl => ctrl.disable());
      this.apiService.submitImage(answer, mission.missionId).subscribe({
        next: data => {
          this.mission.missionStatus = data.missionStatus;
          this.mission.answer = answer;
          this.mission.score = data.score;
          this.updateMission.emit(this.mission);
        },
        error: error => {
          const msg = '上傳圖片失敗！' + ( error.errorMessage || '請聯絡全景娛樂城管理者' );
          this.snackBar.open(msg, '知道了', {
            duration: 2000,
            panelClass: 'my-snackbar'
          });
          this.imageControls.forEach(ctrl => ctrl.enable());
        }
      });
    } else {
      const answer: string = this.inputControl.value;
      this.inputControl.disable();
      this.apiService.submitAnswer(answer, mission.missionId).subscribe({
        next: data => {
          this.mission.missionStatus = data.missionStatus;
          this.mission.answer = answer;
          this.mission.score = data.score;
          this.updateMission.emit(this.mission);
        },
        error: error => {
          const msg = '送出答案失敗！' + ( error.errorMessage || '請聯絡全景娛樂城管理者' );
          this.snackBar.open(msg, '知道了', {
            duration: 2000,
            panelClass: 'my-snackbar'
          });
          this.inputControl.enable();
        }
      });
    }
  }

  removeUploadImage(index: number): void {
    this.imageControls[index].setValue('');
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

  openExample(): void {
    const dialogRef = this.dialog.open(this.example);
  }
}
