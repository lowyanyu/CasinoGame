import { trigger, transition, group, query, style, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgAuthService } from '@cg/ng-auth';
import { Menu } from '@main/enums/menu.enum';
import { User } from '@main/models/user.model';
import { ApiService } from '@main/services/api.service';
import { Subscription, timer } from 'rxjs';
import { tap, map, takeWhile } from 'rxjs/operators';

const fadeIn = [style({ opacity: '0' }), animate('500ms', style({ opacity: '1' }))];

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss'],
  animations: [
    trigger('fadeAnimation', [
      transition('* => *', fadeIn)
    ]),
    trigger('loopAnimation', [
      transition('* => *', group([
        query(':enter', fadeIn, { optional: true })
      ]))
    ])
  ]
})
export class MenuDialogComponent implements OnInit {

  MENU: typeof Menu = Menu;

  showTemplate = Menu.MENU;

  duration: number;
  index = -1;
  members: string[];
  member: string;

  lboardSubscription: Subscription;
  timerSubscription: Subscription;

  leaderBoard: User[];
  lboardStatus = 0;

  constructor(
    private dialogRef: MatDialogRef<MenuDialogComponent>,
    private authService: NgAuthService,
    public router: Router,
    public apiService: ApiService
  ) {
    this.duration = this.apiService.getDurationForLoop();
    this.members = this.apiService.getMembers();
  }

  ngOnInit(): void {
  }

  getTitle(page: string): string {
    switch(page) {
      case Menu.MENU:
        return '';
      case Menu.ABOUT:
        return '工作人員名單';
      case Menu.LEADER_BOARD:
        return '排行榜';
      default:
        return '';
    }
  }

  showMenu(): void {
    if (this.showTemplate === Menu.ABOUT) {
      this.exitAbout();
    } else if (this.showTemplate === Menu.LEADER_BOARD) {
      this.exitLeaderBoard();
    }
    this.showTemplate = Menu.MENU;
  }

  showRank(): void {
    this.showTemplate = Menu.LEADER_BOARD;
    this.getLeaderBoard();
  }

  getLeaderBoard(): void {
    this.lboardStatus = 0;
    this.lboardSubscription = this.apiService.getLeaderBoard().subscribe({
      next: data => {
        this.lboardStatus = 1;
        this.leaderBoard = data.result;
      },
      error: () => {
        this.lboardStatus = -1;
      }
    });
  }

  showAbout(): void {
    this.showTemplate = Menu.ABOUT;
    this.createTimer();
  }

  createTimer(): void {
    this.timerSubscription = timer(100, this.duration).pipe(
      map(() => this.index + 1),
      tap(i => this.index = i),
      takeWhile(() => this.index < this.members.length)
    ).subscribe({
      next: i => {
        this.member = this.members[i];
      }
    });
  }

  exitAbout(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  exitLeaderBoard(): void {
    if (this.lboardSubscription) {
      this.lboardSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.dialogRef.close();
        this.dialogRef.beforeClosed().subscribe({
          next: () => {
            this.apiService.logout();
          }
        });
      }
    });
  }

}
