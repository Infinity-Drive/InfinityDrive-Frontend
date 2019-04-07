import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {AccountService} from '../services/account.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  userName: string;
  isOpened = false;
  accounts = [];
  totalAccounts;
  accountsLimit = 5;

  constructor(private route: Router, private account: AccountService) {
  }

  ngOnInit() {
    this.userName = localStorage.getItem('infinityName');
    this.account.accountsToBeEmited.subscribe((value: any[]) => {
      let count = 0;
      this.totalAccounts = value.length;
      this.accounts = value.filter((value1) => {
        count++;
        //  accounts to be displayed
        if (count <= this.accountsLimit) {
          return value1;
        }
      });
    });
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

  toggleSidebar() {
    this.isOpened = !this.isOpened;
  }

}
