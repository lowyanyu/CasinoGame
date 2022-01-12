import { NgAuthService } from '@cg/ng-auth';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '@main/services/api.service';
import { User } from '@main/models/user.model';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent implements OnInit {

  @ViewChild('qrcodeRef') qrcode: TemplateRef<any>;

  userId: number;
  token: string;
  info: User;

  status: number = 0;

  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private authService: NgAuthService
  ) {
    this.userId = this.authService.getPrincipal().getProperty('userId');
    this.token = this.authService.authToken.accessToken;
    this.apiService.reloadProfile$.pipe(
      distinctUntilChanged()
    ).subscribe({
      next: () => {
        this.getProfile();
      }
    });
  }

  ngOnInit(): void {
  }

  getProfile(): void {
    this.status = 1;
    this.apiService.getProfile(this.userId).subscribe({
      next: data => {
        this.status = 0;
        this.info = data;
      },
      error: error => {
        this.status = 0;
        this.info = undefined;
        // TODO:
      }
    })
  }

  openQRCodeDialog(): void {
    const dialogRef = this.dialog.open(this.qrcode);
    dialogRef.beforeClosed().subscribe({
      next: () => {
        this.getProfile();
      }
    });
  }

  getQRCodeInfo(): string {
    return JSON.stringify({
      'userId': this.userId,
      'token': this.token
    });
  }

}
