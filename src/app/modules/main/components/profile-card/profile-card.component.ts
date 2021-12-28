import { NgAuthService } from '@cg/ng-auth';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '@main/services/api.service';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent implements OnInit {

  @ViewChild('qrcodeRef') qrcode: TemplateRef<any>;

  userId: number;
  token: string;
  info;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private authService: NgAuthService
  ) {
    this.userId = this.authService.getPrincipal().getProperty('userId');
    this.token = this.authService.authToken.accessToken;
  }

  ngOnInit(): void {
    this.getProfile();
  }

  getProfile(): void {
    this.apiService.getProfile().subscribe({
      next: data => {
        this.info = data;
      },
      error: error => {
        // TODO:
      }
    })
  }

  openQRCodeDialog(): void {
    this.dialog.open(this.qrcode);
  }

  getQRCodeInfo(): string {
    return JSON.stringify({
      'userId': this.userId,
      'token': this.token
    });
  }

}
