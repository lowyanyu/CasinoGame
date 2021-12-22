import { trigger, transition, group, query, style, animate } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgAuthService } from '@cg/ng-auth';
import { Subscription, timer } from 'rxjs';
import { tap, map, takeWhile } from 'rxjs/operators';

const fadeIn = [style({ opacity: '0' }), animate('500ms', style({ opacity: '1' }))];

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss'],
  animations: [
    trigger('fade', [
      transition('* => *', fadeIn)
    ]),
    trigger('wordUpdated', [
      transition('* => *', group([
        query(':enter', fadeIn, { optional: true })
      ]))
    ])
  ]
})
export class MenuDialogComponent implements OnInit, OnDestroy {

  showTemplate = 'menu';
  index = -1;
  members = [
    '技術處三組\n\r\n\rEthan 杜宜霖\n\rEvan 林宗霖',
    '技術處四組\n\r\n\rZiv 吳佳翰\n\rDoreen 林語婷\n\rChristy 劉彥妤\n\rEileen 黎怡伶',
    '技術處五組\n\r\n\rMike 陳奕明\n\rCalvin 鄭朝隆\n\r',
  ];
  member: string;

  changeSubscription: Subscription;

  constructor(
    private dialogRef: MatDialogRef<MenuDialogComponent>,
    private authService: NgAuthService,
    public router: Router
  ) {
    this.members.push(this.members.join('\n\r\n\r'));
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.killTimer();
  }

  showMenu(): void {
    this.killTimer();
    this.showTemplate = 'menu';
  }

  showAbout(): void {
    this.showTemplate = 'about';

    this.changeSubscription = timer(100, 3000).pipe(
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
