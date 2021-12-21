import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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

  currentIndex$ = new BehaviorSubject<number>(0);

  questionForm: FormGroup;
  questionAmount: number;

  questionList$ = new BehaviorSubject<Question[]>([]);
  questionItem$ = combineLatest([this.questionList$, this.currentIndex$]).pipe(
    switchMap(([list, index]) => iif(() => list === [], of([]), of(list[index])))
  );

  constructor(
    private fb: FormBuilder,
    public apiService: ApiService
  ) {
    this.questionForm = this.fb.group({});
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
          this.addControl(data.result);
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

  addControl(question: Question[]): void {
    question.forEach(q => this.questionForm.addControl(String(q.questionId), new FormControl('', Validators.required)));
  }

  answerYes(questionId: number): void {
    this.questionForm.controls[String(questionId)].setValue('YES');
    this.showNextQuestion();
  }

  answerNo(questionId: number): void {
    this.questionForm.controls[String(questionId)].setValue('NO');
    this.showNextQuestion();
  }

  showNextQuestion(): void {
    // last question
    if (this.currentIndex$.value === this.questionAmount - 1) {
      console.log(this.questionForm.value);
      this.submitForm();
      return;
    }
    this.currentIndex$.next(this.currentIndex$.getValue() + 1);
  }

  submitForm(): void {
    if (this.questionForm.invalid) {
      return;
    }
    this.apiService.submitQuestion(this.questionForm.value).subscribe({
      next: () => {
      },
      error: error => {
        // TODO:
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
