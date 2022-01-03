import { style, animate, trigger, transition } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgAuthService } from '@cg/ng-auth';
import { GameStatus } from '@main/enums/game-status.enum';
import { Stack, Player } from '@main/models/stack.model';
import { ApiService } from '@main/services/api.service';
import { Subscription } from 'rxjs';

const fadeIn = [style({ opacity: '0' }), animate('500ms', style({ opacity: '1' }))];

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition('* => *', fadeIn)
    ])
  ]
})
export class StackComponent implements OnInit, OnDestroy {

  STATUS: typeof GameStatus = GameStatus;

  stack: Stack;
  stackHist: Stack[];

  stackForm: FormGroup;

  subscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public apiService: ApiService,
    private dialog: MatDialog
  ) {
    this.stackForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.getCurrentStack();
  }

  ngOnDestroy(): void {
    this.snackBar.dismiss();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getCurrentStack(): void {
    this.subscription = this.apiService.getCurrentStack().subscribe({
      next: data => {
        this.stack = data;
        this.stackForm = this.fb.group({});
        this.stack.player.forEach(p => {
          console.log(this.apiService.userPoint$.value);
          let ctrl = new FormControl(0,
            [Validators.compose(
                [Validators.required, Validators.pattern('^[0-9]+(.[0-9]{1,3})?$'), Validators.min(0), Validators.max(this.apiService.userPoint$.value)])]
          );
          if (p.point) {
            ctrl.setValue(p.point);
          }
          this.stackForm.addControl(String(p.playerId), ctrl);
        });
        console.log(this.stackForm.value);
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
          this.getCurrentStack();
        });
      }
    });
  }

  menuIsOpened(): boolean {
    return this.dialog.openDialogs.filter(d => d.id === 'menu-dialog').length !== 0;
  }

  submitStack(): void {
    console.log(this.stackForm.value);
    if (this.stackForm.invalid) {
      return;
    }
    const formVal = this.stackForm.value;
    let stacks: Player[] = [];
    let allZero = true;
    let accum = 0;
    Object.keys(formVal).forEach(player => {
      const point = formVal[player];
      if (point > 0) {
        allZero = false;
      }
      accum += point;
      stacks.push({playerId: parseInt(player), point: point});
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

    this.apiService.submitStack(this.stack.stackId, stacks).subscribe({
      next: () => {
        const merge: Player[] = this.stack.player.map((item, i) => Object.assign({}, item, stacks[i]));
        this.stack.player = merge;
        this.apiService.sGameStatus$.next(GameStatus.COMPLETE);
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
    this.stackForm.controls[playerId].setValue(value);
  }

  getStackHistoryList(): void {
    this.subscription = this.apiService.getStackHistoryList().subscribe({
      next: data => {
        this.stackHist = data;
      },
      error: () => {
        if (this.menuIsOpened()) {
          console.log('menu is open, not showing snackbar');
          return;
        }
        const snackBarRef = this.snackBar.open('載入下注歷史清單失敗', '重新載入', {
          panelClass: ['my-snackbar']
        });
        snackBarRef.onAction().subscribe(() => {
          this.getStackHistoryList();
        });
      }
    });
  }

}
