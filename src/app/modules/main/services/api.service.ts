import { Injectable } from '@angular/core';
import { NgAuthService } from '@cg/ng-auth';
import { NgConfigService } from '@cg/ng-config';
import { MissionGameStatus } from '@main/enums/mission-game-status.enum';
import { QuestionGameStatus } from '@main/enums/question-game-status.enum';
import { Mission, MissionType } from '@main/models/mission.model';
import { Question } from '@main/models/question.model';
import { HttpUtilService } from '@shared/services/http-util.service';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable()
export class ApiService {

  qGameStatus$ = new BehaviorSubject<number>(0);
  mGameStatus$ = new BehaviorSubject<number>(0);

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
    return this.httpUtil.GETMethod({ url: this._profileUrl });
  }

  getQuestionList(): Observable<any> {
    this.qGameStatus$.next(QuestionGameStatus.INIT);
    return this.httpUtil.GETMethod({ url: this._questionUrl }).pipe(
      tap(data => this.qGameStatus$.next(data.status)),
      map(data => {
        const merge: Question[] = data.result.map((item, i) => Object.assign({}, item, this.questionList[i]));
        data.result = merge;
        return data;
      }),
      catchError(() => {
        this.qGameStatus$.next(QuestionGameStatus.ERROR);
        return of([]);
      })
    );
  }

  submitQuestion(answer): Observable<any> {
    return this.httpUtil.POSTMethod({ url: this._questionUrl, body: answer }).pipe(
      tap(() => this.qGameStatus$.next(QuestionGameStatus.COMPLETE))
    );
  }

  getMissionList(): Observable<any> {
    this.mGameStatus$.next(MissionGameStatus.INIT);
    return this.httpUtil.GETMethod({ url: this._missionUrl }).pipe(
      tap(data => this.mGameStatus$.next(data.status)),
      map(data => {
        const merge: Mission[] = data.result.map((item, i) => Object.assign({}, item, this.missionList[i]));
        data.result = merge;
        return data;
      }),
      catchError(() => {
        this.mGameStatus$.next(MissionGameStatus.ERROR);
        return of([]);
      })
    );
  }

  submitMission(answer, mission: Mission): Observable<any> {
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
    return this.httpUtil.POSTMethod({ url: url, body: answer });
  }

  getCurrentStack(): Observable<any> {
    return this.httpUtil.GETMethod({ url: this._stackUrl });
  }
}
