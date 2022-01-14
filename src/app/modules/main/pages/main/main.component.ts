import { style, animate, trigger, transition } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameRulesDialogComponent } from '@main/components/game-rules-dialog/game-rules-dialog.component';
import { MenuDialogComponent } from '@main/components/menu-dialog/menu-dialog.component';
import { Game } from '@main/enums/game-path.enum';
import { ApiService } from '@main/services/api.service';
import { BehaviorSubject } from 'rxjs';

const fade = [style({ opacity: '0' }), animate('500ms', style({ opacity: '1' }))];

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [
    trigger("fadeAnimation", [
      transition("* => *", fade)
    ])
  ]

})
export class MainComponent implements OnInit {

  GAME: typeof Game = Game;

  detectChange$ = new BehaviorSubject<number>(0);

  constructor(
    public router: Router,
    private dialog: MatDialog,
    public apiService: ApiService
  ) {}

  ngOnInit(): void {
    const opened = localStorage.getItem('opened');
    if (opened !== null) {
      console.log('skip open game rules dialog');
      return;
    }
    console.log('open game rules dialog');
    this.dialog.open(GameRulesDialogComponent, {
      id: 'menu-dialog',
      minWidth: '100%',
      height: '100vh',
      autoFocus: false
    });
    localStorage.setItem('opened', 'true');
  }

  reloadProfile(): void {
    // console.log('deactivate');
    const val = this.detectChange$.value;
    this.detectChange$.next(val + 1);
  }

  isActive(path: string): boolean {
    return this.router.isActive(path, false);
  }

  openMenuDialog(): void {
    this.dialog.open(MenuDialogComponent, {
      id: 'menu-dialog',
      minWidth: '100%',
      height: '100vh',
      autoFocus: false
    });
  }

  openGameRulesDialog(): void {
    this.dialog.open(GameRulesDialogComponent, {
      id: 'menu-dialog',
      minWidth: '100%',
      height: '100vh',
      autoFocus: false
    });
  }

}
