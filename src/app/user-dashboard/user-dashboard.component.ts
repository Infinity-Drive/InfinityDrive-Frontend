import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {AccountService} from '../services/account.service';

import Swal from 'sweetalert2';

import { Store } from '@ngrx/store';
import * as AccountActions from './../actions/account.actions';
import { AppState } from '../app.state';
import { HttpErrorResponse } from '@angular/common/http';

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

  constructor(private router: Router,
              private account: AccountService,
              private activateRoute: ActivatedRoute,
              private store: Store<AppState>) {
    this.store.select('account').subscribe((accounts) => this.updateAccounts(accounts));
  }

  ngOnInit() {
    this.userName = localStorage.getItem('infinityName');
    AccountService.isFetchingAccounts = true;

    this.activateRoute.queryParams.subscribe(params => {
      if (params['code']) {
        this.account.saveToken(params['code'], localStorage.getItem('AddingAccountType')).subscribe((data) => {
          this.account.getAccounts().subscribe((accounts: any)=> {
            AccountService.isFetchingAccounts = false;
            accounts.forEach(account => this.store.dispatch(new AccountActions.AddAccount(account)));
            this.router.navigateByUrl('Dashboard/Accounts');
          });
        }, (err: HttpErrorResponse) => {
          AccountService.isFetchingAccounts = false;
          if (err.error === 'Account already exists') {
            Swal.fire('Account already exists', 'add a different account', 'error');
          } else {
            Swal.fire('Shame on us', 'Unable to add account', 'error');
          }
          console.log(err);
          this.router.navigateByUrl('Dashboard/Accounts');
        });
      } else {
        if (!this.totalAccounts) {
          this.account.getAccounts().subscribe((accounts: any)=> {
            AccountService.isFetchingAccounts = false;
            accounts.forEach(account => this.store.dispatch(new AccountActions.AddAccount(account)));
          });
        }
      }
    });
  }

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will logged out of Infinity Drive.',
      type: 'warning',
      showCancelButton: true,
    }).then((result) => {
      if (result.value) {
        this.account.logout().subscribe((data) => {
          localStorage.clear();
          this.router.navigate(['/Login']);
        }, (err: any) => {
          localStorage.clear();
          this.router.navigate(['/Login']);
        });
      }
    });
  }

  toggleSidebar() {
    this.isOpened = !this.isOpened;
  }

  updateAccounts(accounts) {
    this.accounts = accounts;
  }

}
