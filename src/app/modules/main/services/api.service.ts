import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgAuthService } from '@cg/ng-auth';
import { NgConfigService } from '@cg/ng-config';
import { GameRulesDialogComponent } from '@main/components/game-rules-dialog/game-rules-dialog.component';
import { GameStatus } from '@main/enums/game-status.enum';
import { StakeGameStatus } from '@main/enums/stake-game-status.enum';
import { Mission } from '@main/models/mission.model';
import { Question } from '@main/models/question.model';
import { HttpUtilService } from '@shared/services/http-util.service';
import { BehaviorSubject, from, iif, Observable, of, throwError, timer } from 'rxjs';
import { catchError, filter, last, map, switchMap, take, takeLast, takeWhile, tap } from 'rxjs/operators';

const test = false;

@Injectable()
export class ApiService {

  qGameStatus$ = new BehaviorSubject<number>(0);
  mGameStatus$ = new BehaviorSubject<number>(0);
  sGameStatus$ = new BehaviorSubject<number>(0);

  currentIndex$ = new BehaviorSubject<number>(0);
  _cacheAnswers$ = new BehaviorSubject<number[]>([]);

  userPoint$ = new BehaviorSubject<number>(0);

  _userUrl = '';
  _questionUrl = '';
  _missionUrl = '';
  _stakeUrl = '';

  questionList: Question[];
  missionList: Mission[];
  about: any;

  remainingTime$ = new BehaviorSubject<string>('');

  constructor(
    private httpUtil: HttpUtilService,
    private configService: NgConfigService,
    private authService: NgAuthService,
    private dialog: MatDialog
  ) {
    const coreUrl = this.configService.get('coreUrl');
    const apiUrl = `${coreUrl}/api`;
    this._userUrl = `${apiUrl}/user`;
    this._questionUrl = `${apiUrl}/binary`;
    this._missionUrl = `${apiUrl}/mission`;
    this._stakeUrl = `${apiUrl}/stake`;
    this.questionList = this.configService.get('questions');
    this.missionList = this.configService.get('missions');
    this.about = this.configService.get('about');

    const D_DAY = this.parseDate('2022-01-05 20:00:50');

    timer(0, 1000).pipe(
      map(() => new Date()),
      tap(d => d.valueOf() > D_DAY.valueOf() ? this.remainingTime$.next('START') : null),
      switchMap(d => iif(() => d.valueOf() < D_DAY.valueOf(), of(d), of(null))),
      takeWhile(d => d !== null)
    ).subscribe({
      next: d => {
        if (test) {
          return;
        }
        this.remainingTime$.next(this.calcRemainingTime(d, D_DAY));
      }
    });
    this.remainingTime$.pipe(
      filter(r => r === 'START'),
      take(1)
    ).subscribe({
      next: () => {
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
    });
  }

  parseDate(str) { // for iOS
    const parts = str.split(" ");
    const dateparts = parts[0].split("-");
    const timeparts = (parts[1] || "").split(":");
    const year = +dateparts[0];
    const month = +dateparts[1];
    const day = +dateparts[2];
    const hours = timeparts[0] ? +timeparts[0] : 0;
    const minutes = timeparts[1] ? +timeparts[1] : 0;
    const seconds = timeparts[2] ? +timeparts[2] : 0;
    // Treats the string as UTC, but you can remove the `Date.UTC` part and use
    // `new Date` directly to treat the string as local time
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }

  initialize(): void {
    this.qGameStatus$ = new BehaviorSubject<number>(0);
    this.mGameStatus$ = new BehaviorSubject<number>(0);
    this.sGameStatus$ = new BehaviorSubject<number>(0);

    this.currentIndex$ = new BehaviorSubject<number>(0);
    this._cacheAnswers$ = new BehaviorSubject<number[]>([]);

    this.userPoint$ = new BehaviorSubject<number>(0);
  }

  calcRemainingTime(now: Date, end: Date): string {
    const _second = 1000;
    const _minute = _second * 60;
    const _hour = _minute * 60;
    const _day = _hour * 24;

    const distance = end.valueOf() - now.valueOf();
    if (distance < 0) {
      return 'START';
    }
    let days = Math.floor(distance / _day);
    let hours = Math.floor((distance % _day) / _hour);
    let minutes = Math.floor((distance % _hour) / _minute);
    let seconds = Math.floor((distance % _minute) / _second);

    return days + ' 天 '+ hours + ' 小時 '+ minutes + ' 分鐘 ' + seconds + ' 秒';
  }

  getDurationForLoop(): number {
    return this.about.duration;
  }

  getMembers(): string[] {
    const info = this.about.info as Array<any>;
    const members = [];
    let last = '';
    info.forEach(i => {
      const group = '[ ' + i.group + ' ]';
      const person = i.members.join('\n\r');
      const concat = group.concat('\n\r\n\r').concat(person);
      members.push(concat);
      if (i.showAtLast) {
        if (last !== '') {
          last = last.concat('\n\r\n\r');
        }
        last = last.concat(concat);
      }
    });
    if (last !== '') {
      members.push(last);
    }
    return members;
  }

  getProfile(userId: number): Observable<any> {
    const url = `${this._userUrl}/${userId}`;
    return this.httpUtil.GETMethod({ url: url }).pipe(
      tap(data => this.userPoint$.next(data.userPoint))
    );
  }

  getLeaderBoard(): Observable<any> {
    const url = `${this._userUrl}/leaderBoard`;
    return this.httpUtil.GETMethod({ url: url });
  }

  getQuestionList(): Observable<any> {
    this.qGameStatus$.next(GameStatus.INIT);
    return this.httpUtil.GETMethod({ url: this._questionUrl }).pipe(
      tap(data => this.qGameStatus$.next(data.status)),
      map(data => {
        if (data.result) {
          data.result.sort(function(a, b) {
            return a.questionId - b.questionId;
          });
          const merge: Question[] = data.result.map((item, i) => Object.assign({}, item, this.questionList[i]));
          data.result = merge;
        } else {
          data.result = this.questionList;
        }
        return data;
      }),
      catchError(() => {
        this.qGameStatus$.next(GameStatus.ERROR);
        // return of([]);
        return throwError('Get question list occur error');
      })
    );
  }

  answerQuestion(answer: number): void {
    const arr = this._cacheAnswers$.value;
    arr.push(answer);
    this._cacheAnswers$.next(arr);
    this.updateCurrentIndex();
  }

  updateCurrentIndex(): void {
    const newIndex = this.currentIndex$.value + 1;
    if (newIndex === 10) {
      this.submitQuestion().subscribe({
        next: () => {
          this._cacheAnswers$.next([]);
          this.currentIndex$.next(0);
        },
        error: () => {
          this._cacheAnswers$.next([]);
          this.currentIndex$.next(0);
        }
      });
      return;
    }
    this.currentIndex$.next(newIndex);
  }

  submitQuestion(): Observable<any> {
    const body = {
      choose: this._cacheAnswers$.value
    };
    return this.httpUtil.POSTMethod({ url: this._questionUrl, body: body }).pipe(
      tap(() => this.qGameStatus$.next(GameStatus.COMPLETE)),
      catchError(() => {
        this.qGameStatus$.next(GameStatus.ERROR);
        return throwError('Submit question occur error');
      })
    )
  }

  getMissionList(): Observable<any> {
    this.mGameStatus$.next(GameStatus.INIT);
    return this.httpUtil.GETMethod({ url: this._missionUrl }).pipe(
      tap(data => this.mGameStatus$.next(data.status)),
      map(data => {
        if (data.result) {
          data.result.sort(function(a, b) {
            return a.missionId - b.missionId;
          });
          const merge: Mission[] = data.result.map((item, i) => Object.assign({}, item, this.missionList[i]));
          data.result = merge;
        } else {
          data.result = this.missionList;
        }
        return data;
      }),
      catchError(() => {
        this.mGameStatus$.next(GameStatus.ERROR);
        // return of([]);
        return throwError('Get mission list occur error');
      })
    );
  }

  submitImage(answers: string[], missionId: number): Observable<any> {
    const body = {
      answer: answers
    };
    const url = `${this._missionUrl}/image/${missionId}`
    return this.httpUtil.POSTMethod({ url: url, body: body });
  }

  submitAnswer(answer: string, missionId: number): Observable<any> {
    const body = {
      answer: answer.trim()
    };
    const url = `${this._missionUrl}/answer/${missionId}`
    return this.httpUtil.POSTMethod({ url: url, body: body });
  }

  getCurrentStake(): Observable<any> {
    this.sGameStatus$.next(StakeGameStatus.INIT);
    return this.httpUtil.GETMethod({ url: this._stakeUrl }).pipe(
      tap(data => data === undefined ? this.sGameStatus$.next(StakeGameStatus.BLANK) : this.sGameStatus$.next(data.status)),
      filter(data => data !== undefined),
      catchError(() => {
        this.sGameStatus$.next(StakeGameStatus.ERROR);
        // return of([]);
        return throwError('Get current stake occur error');
      })
    );
  }

  // getCurrentStake(): Observable<any> {
  //   this.sGameStatus$.next(GameStatus.INIT);
  //   return this.httpUtil.GETMethod({ url: this._stakeUrl }).pipe(
  //     tap(data => Object.keys(data).length === 0 ? this.sGameStatus$.next(GameStatus.BLANK) : this.sGameStatus$.next(data.status)),
  //     filter(data => Object.keys(data).length !== 0),
  //     mergeMap(data => {
  //       return this.getStakeHistoryList().pipe(
  //         map(resp => resp.result.filter(his => his.stakeId === data.stakeId)[0]),
  //         switchMap(stake => iif(() => stake !== undefined, of(stake), of(data)))
  //       );
  //     }),
  //     tap(stake => {
  //       if (stake.createTime !== undefined) {
  //         // console.log('stake is completed');
  //         this.sGameStatus$.next(GameStatus.COMPLETE);
  //       } else {
  //         // console.log('stake is not completed');
  //       }
  //     }),
  //     catchError(() => {
  //       this.sGameStatus$.next(GameStatus.ERROR);
  //       // return of([]);
  //       return throwError('Get current stake occur error');
  //     })
  //   );
  // }

  // getStakeFromHistoryList(data: Stake, his: Stake[]): Stake {
  //   return his.filter(h => h.stakeId === data.stakeId)[0];
  // }

  getStakeHistoryList(): Observable<any> {
    const url = `${this._stakeUrl}/history`;
    return this.httpUtil.GETMethod({ url: url });
  }

  submitStake(stakeId: number, stakes: any[]): Observable<any> {
    const url = `${this._stakeUrl}/${stakeId}`;
    return this.httpUtil.POSTMethod({ url: url, body: stakes });
  }
}
