import { trigger, transition, style, animate } from '@angular/animations';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BinaryAnswer } from '@main/enums/binary-answer.enum';
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

  BINARY_ANS: typeof BinaryAnswer = BinaryAnswer;

  choices = [
    this.BINARY_ANS.YES, this.BINARY_ANS.NO, this.BINARY_ANS.SKIP
  ];

  @Input() question: Question;
  @Output() answer = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
    console.log('question card component ngOnInit:', this.question);
  }

  answerQuestion(choose: number): void {
    this.answer.emit(choose);
  }

}
