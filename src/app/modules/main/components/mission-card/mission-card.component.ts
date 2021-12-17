import { style, animate, trigger, transition } from '@angular/animations';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { Mission } from '@main/models/mission.model';

const swipe = [style({ transform: 'translateX(100%)' }), animate('.5s ease-out', style({ transform: 'translateX(0%)' }))];
const fade = [style({ opacity: '0' }), animate('500ms', style({ opacity: '1' }))];

@Component({
  selector: 'app-mission-card',
  templateUrl: './mission-card.component.html',
  styleUrls: ['./mission-card.component.scss'],
  animations: [
    trigger("animation", [
      transition("* => *", swipe)
    ])
  ]
})
export class MissionCardComponent implements OnInit {

  @Input() mission: Mission;

  constructor() { }

  ngOnInit(): void {
  }

}
