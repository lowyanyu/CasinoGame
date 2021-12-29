import { Injectable } from '@angular/core';
import { NgAuthService } from '@cg/ng-auth';
import { NgConfigService } from '@cg/ng-config';
import { GameStatus } from '@main/enums/game-status.enum';
import { Mission } from '@main/models/mission.model';
import { Question } from '@main/models/question.model';
import { Stack } from '@main/models/stack.model';
import { HttpUtilService } from '@shared/services/http-util.service';
import { BehaviorSubject, iif, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, tap } from 'rxjs/operators';

const D_DAY = new Date('2021-12-30 9:00:00');

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
  _stackUrl = '';

  questionList: Question[];
  missionList: Mission[];
  about: any;

  constructor(
    private httpUtil: HttpUtilService,
    private configService: NgConfigService,
    private authService: NgAuthService
  ) {
    const coreUrl = this.configService.get('coreUrl');
    const apiUrl = `${coreUrl}/api`;
    this._userUrl = `${apiUrl}/user`;
    this._questionUrl = `${apiUrl}/binary`;
    this._missionUrl = `${apiUrl}/mission`;
    this._stackUrl = `${apiUrl}/stack`;
    this.questionList = this.configService.get('questions');
    this.missionList = this.configService.get('missions');
    this.about = this.configService.get('about');
  }

  isDDay(): boolean {
    return (new Date() <= D_DAY ) ? true : false;
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
        next: () => {},
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
    const url = `${this._missionUrl}/image/${missionId}`
    return this.httpUtil.POSTMethod({ url: url, body: answers });
  }

  submitAnswer(answer: string, missionId: number): Observable<any> {
    const url = `${this._missionUrl}/answer/${missionId}`
    return this.httpUtil.POSTMethod({ url: url, body: answer });
  }

  getCurrentStack(): Observable<any> {
    this.sGameStatus$.next(GameStatus.INIT);
    return this.httpUtil.GETMethod({ url: this._stackUrl }).pipe(
      tap(data => Object.keys(data).length === 0 ? this.sGameStatus$.next(GameStatus.BLANK) : this.sGameStatus$.next(data.status)),
      filter(data => Object.keys(data).length !== 0),
      mergeMap(data => {
        return this.getStackHistoryList().pipe(
          map(resp => resp.result.filter(his => his.stackId === data.stackId)[0]),
          switchMap(stack => iif(() => stack !== undefined, of(stack), of(data)))
        );
      }),
      tap(stack => {
        if (stack.createTime !== undefined) {
          // console.log('stack is completed');
          this.sGameStatus$.next(GameStatus.COMPLETE);
        } else {
          // console.log('stack is not completed');
        }
      }),
      catchError(() => {
        this.sGameStatus$.next(GameStatus.ERROR);
        // return of([]);
        return throwError('Get current stack occur error');
      })
    );
  }

  getStackFromHistoryList(data: Stack, his: Stack[]): Stack {
    return his.filter(h => h.stackId === data.stackId)[0];
  }

  getStackHistoryList(): Observable<any> {
    const url = `${this._stackUrl}/history`;
    return this.httpUtil.GETMethod({ url: url });
  }

  submitStack(stackId: number, stacks: any[]): Observable<any> {
    const url = `${this._stackUrl}/${stackId}`;
    return this.httpUtil.POSTMethod({ url: url, body: stacks });
  }
}
