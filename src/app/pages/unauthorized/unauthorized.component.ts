import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription, timer } from 'rxjs';
import { filter, takeWhile, tap } from 'rxjs/operators';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit, OnDestroy {

  timer$ = new BehaviorSubject<number>(4);
  timerSubscription: Subscription;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    this.timerSubscription = timer(100, 1000).pipe(
      takeWhile(() => this.timer$.value > 0),
      tap(() => this.timer$.next(this.timer$.value - 1)),
      filter(() => this.timer$.value === 0)
    ).subscribe({
      next: () => {
        this.backToHome();
      }
    });
  }

  backToHome(): void {
    this.router.navigate(['home']);
  }

  ngOnDestroy(): void {
    this.timerSubscription.unsubscribe();
  }

}
