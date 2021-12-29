import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgCryptoService } from '@cg/ng-crypto';
import { LoginService } from '@home/services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private crypto: NgCryptoService
  ) {
    this.loginForm = this.fb.group({
      account: ['', Validators.required],
      pwd: ['', Validators.required]
    })
  }

  ngOnInit(): void {
  }

  login(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const value = this.loginForm.value;
    this.loginService.login(value.account, this.crypto.sha256(value.pwd)).subscribe({
      next: () => {
        this.router.navigate(['/main']);
      },
      error: error => {
        // TODO:
      }
    })
  }

}
