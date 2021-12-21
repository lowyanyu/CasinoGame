import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @HostListener('window:click') onMouseEnter() {
    this.router.navigateByUrl('/home/login');
  }
  @HostListener('touchStart', ['$event'])
  @HostListener('touchend', ['$event'])
  @HostListener('touchcancel', ['$event'])
  handleTouch(event) {
    this.router.navigateByUrl('/home/login');
  }

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

}
