import { style, animate, trigger, transition } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@main/enums/game-path.enum';
import { BehaviorSubject } from 'rxjs';

const swipe = [style({ transform: 'translateX(100%)' }), animate('.5s ease-out', style({ transform: 'translateX(0%)' }))];
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
    public router: Router
  ) { }

  ngOnInit(): void {
  }

  reloadProfile(): void {
    console.log('deactivate');
    const val = this.detectChange$.value;
    this.detectChange$.next(val + 1);
  }

  isActive(path: string): boolean {
    return this.router.isActive(path, false);
  }

}
