import { style, animate, trigger, state, transition } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgAuthService } from '@cg/ng-auth';
import { GameStatus } from '@main/enums/game-status.enum';
import { Stack } from '@main/models/stack.model';
import { ApiService } from '@main/services/api.service';
import { from, Subscription } from 'rxjs';

const flyIn = [style({ transform: 'translateX(100%)' }), animate('0.5s ease-in')];
const fadeOut = [style({ opacity: '1' }), animate('0.5s ease-out', style({ opacity: '0' }))];

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0%)'})),
      transition('void => *', flyIn),
      transition('* => void', fadeOut)
    ])
  ]
})
export class StackComponent implements OnInit, OnDestroy {

  STATUS: typeof GameStatus = GameStatus;

  stack: Stack;

  stackForm: FormGroup;

  subscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    public apiService: ApiService
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
        const snackBarRef = this.snackBar.open('載入問答題目失敗', '重新載入', {
          panelClass: ['my-snackbar']
        });
        snackBarRef.onAction().subscribe(() => {
          this.getCurrentStack();
        });
      }
    })
  }

  submitStack(): void {
    console.log(this.stackForm.value);
    // this.stackForm.controls.stack.setValue(val);
  }

  verifyInput(event): void {
    const value = event.target.value;
    event.target.value = parseInt(value);
    console.log(value);
  }

}
