import { trigger, transition, group, query, style, animate } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class MenuDialogComponent implements OnInit, OnDestroy {

  MENU: typeof Menu = Menu;

  showTemplate = Menu.MENU;

  duration: number;
  index = -1;
  members: string[];
  member: string;

  changeSubscription: Subscription;

  leaderBoard: User[];

  constructor(
    private dialogRef: MatDialogRef<MenuDialogComponent>,
    private authService: NgAuthService,
    public router: Router,
    private apiService: ApiService
  ) {
    this.duration = this.apiService.getDurationForLoop();
    this.members = this.apiService.getMembers();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.killTimer();
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
    this.killTimer();
    this.showTemplate = Menu.MENU;
  }

  showRank(): void {
    this.showTemplate = Menu.LEADER_BOARD;
    this.getLeaderBoard();
  }

  getLeaderBoard(): void {
    this.apiService.getLeaderBoard().subscribe({
      next: data => {
        this.leaderBoard = data.result;
      },
      error: error => {
        // TODO:
      }
    });
  }

  showAbout(): void {
    this.showTemplate = Menu.ABOUT;

    this.changeSubscription = timer(100, this.duration).pipe(
      map(() => this.index + 1),
      tap(i => this.index = i),
      takeWhile(() => this.index < this.members.length)
    ).subscribe({
      next: i => {
        this.member = this.members[i];
      }
    });
  }

  killTimer(): void {
    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.dialogRef.close();
        this.router.navigate(['/home']);
      }
    });
  }

}
