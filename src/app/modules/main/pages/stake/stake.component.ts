import { style, animate, trigger, transition } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StakeGameStatus } from '@main/enums/stake-game-status.enum';
import { Stake, Player } from '@main/models/stake.model';
import { ApiService } from '@main/services/api.service';
import { Subscription } from 'rxjs';

const fadeIn = [style({ opacity: '0' }), animate('500ms', style({ opacity: '1' }))];

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition('* => *', fadeIn)
    ])
  ]
})
export class StakeComponent implements OnInit, OnDestroy {

  STATUS: typeof StakeGameStatus = StakeGameStatus;

  stake: Stake;
  stakeForm: FormGroup;
  subscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public apiService: ApiService,
    private dialog: MatDialog,
    public router: Router
  ) {
    this.stakeForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.getCurrentStake();
  }

  ngOnDestroy(): void {
    this.snackBar.dismiss();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getCurrentStake(): void {
    this.subscription = this.apiService.getCurrentStake().subscribe({
      next: data => {
        this.stake = data;
        const status = this.apiService.sGameStatus$.value;
        if (status !== StakeGameStatus.START && status !== StakeGameStatus.STOP) {
          return;
        }
        this.stakeForm = this.fb.group({});
        this.stake.player.forEach(p => {
          console.log(this.apiService.userPoint$.value);
          let ctrl = new FormControl(0);
          this.apiService.userPoint$.subscribe({
            next: p => {
              ctrl.setValidators([Validators.compose(
                  [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,3})?$'), Validators.min(0), Validators.max(p)])]);
              ctrl.updateValueAndValidity();
            }
          });
          if (p.point) {
            this.apiService.sGameStatus$.next(StakeGameStatus.COMPLETE);
            ctrl.setValue(p.point);
          }
          this.stakeForm.addControl(String(p.playerId), ctrl);
        });
        // console.log(this.stakeForm.value);
      },
      error: () => {
        if (this.menuIsOpened()) {
          console.log('menu is open, not showing snackbar');
          return;
        }
        const snackBarRef = this.snackBar.open('取得進行中賭盤失敗', '重新載入', {
          panelClass: ['my-snackbar']
        });
        snackBarRef.onAction().subscribe(() => {
          this.getCurrentStake();
        });
      }
    });
  }

  menuIsOpened(): boolean {
    return this.dialog.openDialogs.filter(d => d.id === 'menu-dialog').length !== 0;
  }

  submitStake(): void {
    // console.log(this.stakeForm.value);
    if (this.stakeForm.invalid) {
      return;
    }
    const formVal = this.stakeForm.value;
    let stakes: Player[] = [];
    let allZero = true;
    let accum = 0;
    Object.keys(formVal).forEach(player => {
      const point = formVal[player];
      if (point > 0) {
        allZero = false;
      }
      accum += point;
      stakes.push({playerId: parseInt(player), point: point});
    });
    if (allZero) {
      this.snackBar.open('你沒有下注任何金額！', '知道了', {
        duration: 2000,
        panelClass: ['my-snackbar']
      });
      return;
    }
    if (accum > this.apiService.userPoint$.value) {
      this.snackBar.open('你的籌碼不足啦！', '知道了', {
        duration: 2000,
        panelClass: ['my-snackbar']
      });
      return;
    }

    this.apiService.submitStake(this.stake.stakeId, stakes).subscribe({
      next: () => {
        const merge: Player[] = this.stake.player.map((item, i) => Object.assign({}, item, stakes[i]));
        this.stake.player = merge;
        this.apiService.sGameStatus$.next(StakeGameStatus.COMPLETE);
      },
      error: error => {
        const msg = '下注失敗！' + ( error.errorMessage || '請聯絡全景娛樂城管理者' );
        this.snackBar.open(msg, '知道了', {
          duration: 2000,
          panelClass: ['my-snackbar']
        });
      }
    });
  }

  verifyInput(event, playerId): void {
    console.log('verify input');
    let value = 0;
    value = parseInt(event.target.value);
    value = isNaN(value) ? 0 : value;
    event.target.value = value;
    this.stakeForm.controls[playerId].setValue(value);
  }

  showStakeHist(): void {
    this.router.navigate(['main/stake/history']);
  }

  getWinCount(stake: Stake): string {
    const totalPoint = stake.player.map(item => (item.point ? item.point : 0)).reduce((a , b) => a + b, 0);
    const win = stake.winPoint - totalPoint;
    if (win === 0) {
      return '沒輸沒贏';
    } else if (win > 0) {
      return '您贏得了 ' + win + ' 籌碼';
    } else if (win < 0) {
      return '您虧了 ' + -win + ' 籌碼 QQ';
    }
  }

}
