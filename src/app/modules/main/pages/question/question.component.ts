import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '@main/components/confirm-dialog/confirm-dialog.component';
import { BinaryAnswer } from '@main/enums/binary-answer.enum';
import { GameStatus } from '@main/enums/game-status.enum';
import { Choice, Question } from '@main/models/question.model';
import { ApiService } from '@main/services/api.service';
import { BehaviorSubject, combineLatest, iif, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const flyIn = [style({ transform: 'translateX(100%)' }), animate('0.5s ease-in')];
const fadeOut = [style({ opacity: '1' }), animate('0.5s ease-out', style({ opacity: '0' }))];

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0%)'})),
      transition('void => *', flyIn),
      transition('* => void', fadeOut)
    ])
  ]
})
export class QuestionComponent implements OnInit, OnDestroy {

  STATUS: typeof GameStatus = GameStatus;

  questionAmount: number;

  questionList$ = new BehaviorSubject<Question[]>([]);
  questionItem$ = combineLatest([this.questionList$, this.apiService.currentIndex$]).pipe(
    switchMap(([list, index]) => iif(() => list === [], of([]), of(list[index])))
  );

  subscription: Subscription;

  constructor(
    public apiService: ApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    // console.log('question component ngOnInit');
    this.getQuestionList();
  }

  ngOnDestroy(): void {
    this.snackBar.dismiss();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getQuestionList(): void {
    this.subscription = this.apiService.getQuestionList().subscribe({
      next: data => {
        this.questionAmount = data.result.length;
        this.questionList$.next(data.result);
      },
      error: () => {
        const snackBarRef = this.snackBar.open('載入問答題目失敗', '重新載入', {
          panelClass: ['my-snackbar']
        });
        snackBarRef.onAction().subscribe(() => {
          this.getQuestionList();
        });
      }
    });
  }

  answerQuestion(answer: number): void {
    if (answer === BinaryAnswer.SKIP) {
      this.openSkipConfirmDialog();
      return;
    }
    this.apiService.answerQuestion(answer);
  }

  openSkipConfirmDialog(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      minWidth: '280px',
      autoFocus: false
    });
    dialogRef.beforeClosed().subscribe({
      next: resp => {
        if (resp) {
          this.apiService.answerQuestion(BinaryAnswer.SKIP);
        }
      }
    })
  }

  getChoice(choose: number): string {
    switch(choose) {
      case Choice.YES:
        return 'Yes';
      case Choice.NO:
        return 'No';
      case Choice.SKIP:
        return '--';
      default:
        return '未作答';
    }
  }

  getCorrect(list: Question[]): number {
    return list.filter(item => item.score === 10).length;
  }

  getTotalWin(list: Question[]): number {
    return list.map(item => (item.score ? item.score : 0)).reduce((a , b) => a + b, 0);
  }

}
