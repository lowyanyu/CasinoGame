import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NgCryptoService } from '@cg/ng-crypto';
import { LoginService } from '@home/services/login.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;

  loginStatus = 0;
  loginSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private snackBar: MatSnackBar,
    private crypto: NgCryptoService
  ) {
    this.loginForm = this.fb.group({
      account: ['', Validators.required],
      pwd: ['', Validators.required]
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.snackBar.dismiss();
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe();
    }
  }

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loginStatus = 1;
    const value = this.loginForm.value;
    this.loginSubscription = this.loginService.login(value.account, this.crypto.sha256(value.pwd)).subscribe({
      next: () => {
        this.loginStatus = 0;
        this.router.navigate(['main']);
      },
      error: error => {
        this.loginStatus = 0;
        const msg = '登入失敗！' + ( error.errorMessage || '請聯絡全景娛樂城管理者' );
        this.snackBar.open(msg, '知道了', {
          duration: 2000,
          panelClass: 'my-snackbar'
        });
      }
    })
  }

}
