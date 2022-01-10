import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @HostListener('window:click') onMouseEnter(event) {
    this.router.navigateByUrl('/home/login');
  }
  @HostListener('touchstart', ['$event'])
  // @HostListener('touchend', ['$event'])
  // @HostListener('touchcancel', ['$event'])
  handleTouch(event) {
    event.preventDefault();
    this.router.navigateByUrl('/home/login');
  }

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

}
