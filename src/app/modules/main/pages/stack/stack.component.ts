import { style, animate, trigger, state, transition } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Stack } from '@main/models/stack.model';
import { ApiService } from '@main/services/api.service';

const flyIn = [style({ transform: 'translateY(100%)' }), animate('0.5s ease-in')];
const fadeOut = [style({ opacity: '1' }), animate('0.5s ease-out', style({ opacity: '0' }))];

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss'],
  animations: [
    trigger('flyInOut', [
      state('in', style({transform: 'translateY(0%)'})),
      transition('void => *', flyIn),
      transition('* => void', fadeOut)
    ])
  ]
})
export class StackComponent implements OnInit {

  stack: Stack;

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.getCurrentStack();
  }

  getCurrentStack(): void {
    this.apiService.getCurrentStack().subscribe({
      next: data => {
        this.stack = data;
      },
      error: error => {
        // TODO:
      }
    })
  }

}
