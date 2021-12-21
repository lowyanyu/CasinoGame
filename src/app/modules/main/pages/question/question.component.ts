import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@main/components/confirm-dialog/confirm-dialog.component';
import { BinaryAnswer } from '@main/enums/binary-answer.enum';
import { QuestionGameStatus } from '@main/enums/question-game-status.enum';
import { Choice, Question } from '@main/models/question.model';
import { ApiService } from '@main/services/api.service';
import { BehaviorSubject, combineLatest, iif, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateX(0%)'})),
      transition('void => *', [
        style({
          transform: 'translateX(100%)'
        }),
        animate('0.5s ease-in')
      ]),
      transition('* => void', [
        animate('0.5s 0.1s ease-out', style({
          transform: 'translateX(0%)'
        }))
      ])
    ])
  ]
})
export class QuestionComponent implements OnInit {

  STATUS: typeof QuestionGameStatus = QuestionGameStatus;

  questionAmount: number;

  questionList$ = new BehaviorSubject<Question[]>([]);
  questionItem$ = combineLatest([this.questionList$, this.apiService.currentIndex$]).pipe(
    switchMap(([list, index]) => iif(() => list === [], of([]), of(list[index])))
  );

  constructor(
    public apiService: ApiService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    console.log('question component ngOnInit');
    this.getQuestionList();
  }

  getQuestionList(): void {
    this.apiService.getQuestionList().subscribe({
      next: data => {
        if (data.result && data.result.length > 0) {
          this.questionAmount = data.result.length;
          this.questionList$.next(data.result);
        } else {
          this.questionAmount = 0;
          this.questionList$.next([]);
        }
      },
      error: error => {
        // TODO:
        this.questionAmount = 0;
        this.questionList$.next([]);
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
        return '';
    }
  }

  getCorrect(list: Question[]): number {
    return list.filter(item => item.score === 10).length;
  }

  getTotalWin(list: Question[]): number {
    return list.map(item => item.score).reduce((a , b) => a + b, 0);
  }

}
