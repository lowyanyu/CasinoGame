import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgAuthService } from '@cg/ng-auth';

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss']
})
export class MenuDialogComponent implements OnInit {

  showTemplate = 'menu';

  constructor(
    private dialogRef: MatDialogRef<MenuDialogComponent>,
    private authService: NgAuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  showMenu(): void {
    this.showTemplate = 'menu';
  }

  showAbout(): void {
    this.showTemplate = 'about';
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.dialogRef.close();
        this.router.navigate(['/home']);
      }
    })
  }

}
