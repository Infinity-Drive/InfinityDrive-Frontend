import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  userName: string;
  constructor(private route: Router) { }

  ngOnInit() {
    this.userName = localStorage.getItem('infinityName');
  }

  logout() {
    this.route.navigate(['']);
    localStorage.removeItem('infinityGuard');
    localStorage.removeItem('infinityToken');
    localStorage.removeItem('infinityEmail');
    localStorage.removeItem('infinityId');
    localStorage.removeItem('infinityName');
  }

}