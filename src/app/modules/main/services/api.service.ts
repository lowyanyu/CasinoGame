import { Injectable } from '@angular/core';
import { NgAuthService } from '@cg/ng-auth';
import { NgConfigService } from '@cg/ng-config';
import { GameStatus } from '@main/enums/game-status.enum';
import { Mission, MissionType } from '@main/models/mission.model';
import { Question } from '@main/models/question.model';
import { Stack } from '@main/models/stack.model';
import { HttpUtilService } from '@shared/services/http-util.service';
import { BehaviorSubject, iif, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, takeWhile, tap } from 'rxjs/operators';

@Injectable()
export class ApiService {

  qGameStatus$ = new BehaviorSubject<number>(0);
  mGameStatus$ = new BehaviorSubject<number>(0);
  sGameStatus$ = new BehaviorSubject<number>(0);

  currentIndex$ = new BehaviorSubject<number>(0);
  _cacheAnswers$ = new BehaviorSubject<number[]>([]);

  userPoint$ = new BehaviorSubject<number>(0);

  _profileUrl = '';
  _questionUrl = '';
  _missionUrl = '';
  _stackUrl = '';

  questionList: Question[];
  missionList: Mission[];

  constructor(
    private httpUtil: HttpUtilService,
    private configService: NgConfigService,
    private authService: NgAuthService
  ) {
    const coreUrl = this.configService.get('coreUrl');
    const apiUrl = `${coreUrl}/api`;
    const userId = this.authService.getPrincipal().getProperty('userId');
    this._profileUrl = `${apiUrl}/user/${userId}`;
    this._questionUrl = `${apiUrl}/binary`;
    this._missionUrl = `${apiUrl}/mission`;
    this._stackUrl = `${apiUrl}/stack`;
    this.questionList = this.configService.get('questions');
    this.missionList = this.configService.get('missions');
  }

  getProfile(): Observable<any> {
    return this.httpUtil.GETMethod({ url: this._profileUrl }).pipe(
      tap(data => this.userPoint$.next(data.userPoint))
    )
  }

  getQuestionList(): Observable<any> {
    this.qGameStatus$.next(GameStatus.INIT);
    return this.httpUtil.GETMethod({ url: this._questionUrl }).pipe(
      tap(data => this.qGameStatus$.next(data.status)),
      map(data => {
        const merge: Question[] = data.result.map((item, i) => Object.assign({}, item, this.questionList[i]));
        data.result = merge;
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
    return this.httpUtil.POSTMethod({ url: this._questionUrl, body: this._cacheAnswers$.value }).pipe(
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
        const merge: Mission[] = data.result.map((item, i) => Object.assign({}, item, this.missionList[i]));
        data.result = merge;
        return data;
      }),
      catchError(() => {
        this.mGameStatus$.next(GameStatus.ERROR);
        // return of([]);
        return throwError('Get mission list occur error');
      })
    );
  }

  submitMission(answers: Array<any>, mission: Mission): Observable<any> {
    let apiPath;
    switch(mission.missionType) {
      case MissionType.IMAGE:
        apiPath = 'image';
        break;
      case MissionType.CHOOSE:
        apiPath = 'choose';
        break;
      case MissionType.SHORT_TEXT:
        apiPath = 'short';
        break;
      default:
        return throwError('Unknown mission type');
    }
    const url = `${this._missionUrl}/${apiPath}/${mission.missionId}`
    return this.httpUtil.POSTMethod({ url: url, body: answers });
  }

  getCurrentStack(): Observable<any> {
    this.sGameStatus$.next(GameStatus.INIT);
    return this.httpUtil.GETMethod({ url: this._stackUrl }).pipe(
      tap(data => Object.keys(data).length === 0 ? this.sGameStatus$.next(GameStatus.BLANK) : this.sGameStatus$.next(data.status)),
      filter(data => Object.keys(data).length !== 0),
      tap(x => console.log(x)),
      mergeMap(data => {
        return this.getStackHistoryList().pipe(
          map(resp => resp.result.filter(his => his.stackId === data.stackId)[0]),
          switchMap(stack => iif(() => stack !== undefined, of(stack), of(data)))
        );
      }),
      tap(stack => {
        if (stack.createTime !== undefined) {
          console.log('stack is completed');
          this.sGameStatus$.next(GameStatus.COMPLETE);
        } else {
          console.log('stack is not completed');
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
}
