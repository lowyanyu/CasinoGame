import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
    private loginService: LoginService
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
    this.loginService.login(value.account, value.pwd).subscribe({
      next: () => {
        this.router.navigateByUrl('/main');
      },
      error: error => {
        // TODO:
      }
    })
  }

}
