import { Component, OnInit } from '@angular/core';
import { ApiService } from '@main/services/api.service';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent implements OnInit {

  info;

  constructor(
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    this.getProfile();
  }

  getProfile(): void {
    this.apiService.getProfile().subscribe({
      next: data => {
        this.info = data;
      },
      error: error => {
        // TODO:
      }
    })
  }

}
