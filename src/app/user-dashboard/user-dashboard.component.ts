import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  userName: string;
  isOpened = false;

  constructor(private route: Router, private account: AccountService) { }

  ngOnInit() {
    this.userName = localStorage.getItem('infinityName');
  }

  logout() {
    localStorage.removeItem('infinityGuard');
    localStorage.removeItem('infinityToken');
    localStorage.removeItem('infinityEmail');
    localStorage.removeItem('infinityId');
    localStorage.removeItem('infinityName');
    this.account.accounts = [];
    this.route.navigate(['']);
  }

  toggleSidebar(){
    this.isOpened = !this.isOpened;
  }

}
