import { trigger, transition, style, animate } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Question } from '@main/models/question.model';

const swipe = [style({ transform: 'translateX(100%)' }), animate('.5s ease-out', style({ transform: 'translateX(0%)' }))];
const fade = [style({ opacity: '0' }), animate('500ms', style({ opacity: '1' }))];

@Component({
  selector: 'app-question-card',
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.scss'],
  animations: [
    trigger("fadeAnimation", [
      transition("* => *", swipe)
    ])
  ]
})
export class QuestionCardComponent implements OnInit {

  @Input() question: Question;
  @Output() yes = new EventEmitter<any>();
  @Output() no = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    console.log(this.question);
  }

  clickYes(): void {
    this.yes.emit(this.question.questionId);
  }

  clickNo(): void {
    this.no.emit(this.question.questionId);
  }

}
