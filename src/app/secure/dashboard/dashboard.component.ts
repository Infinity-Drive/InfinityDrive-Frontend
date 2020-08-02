import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';

import {AccountService} from '../../services/account.service';

import Swal from 'sweetalert2';

import { Store } from '@ngrx/store';
import * as AccountActions from '../../actions/account.actions';
import { AppState } from '../../app.state';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmitterService } from '../../services/emitter.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class UserDashboardComponent implements OnInit,OnDestroy {
  userName: string;
  isOpened = false;
  accounts = [];
  totalAccounts;
  accountsLimit = 5;
  intialized = false;
  public ngDestroy$ = new Subject();

  constructor(
    private router: Router,
    private account: AccountService,
    private activateRoute: ActivatedRoute,
    private location: Location,
    private store: Store<AppState>,
    private emitterService: EmitterService
  ) {}

  ngOnInit() {
    this.store.select('account').pipe(takeUntil(this.ngDestroy$)).subscribe(accounts => this.updateAccounts(accounts));
    this.userName = localStorage.getItem('infinityName');

    this.activateRoute.queryParams.subscribe(params => {
      if (!this.intialized) {
        this.intialized = true; // only run subscription call once
        if (params['code']) {
          AccountService.isFetchingAccounts = true;
          this.account.saveToken(params['code'], localStorage.getItem('AddingAccountType')).subscribe((data) => {
            this.account.getAccounts().subscribe((accounts: any)=> {
              this.store.dispatch(new AccountActions.SetAccounts(accounts));
              AccountService.isFetchingAccounts = false;
              this.location.replaceState(`Dashboard/Accounts`);
            });
          }, (err: HttpErrorResponse) => {
            AccountService.isFetchingAccounts = false;
            if (err.error === 'Account already exists') {
              Swal.fire('Account already exists', 'add a different account', 'error');
            } else {
              Swal.fire('Shame on us', 'Unable to add account', 'error');
            }
            console.log(err);
            this.location.replaceState(`Dashboard/Accounts`);
          });
        } else {
          AccountService.isFetchingAccounts = true;
          this.account.getAccounts().subscribe((accounts: any)=> {
            AccountService.isFetchingAccounts = false;
            this.store.dispatch(new AccountActions.SetAccounts(accounts));
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
    this.emitterService.emit('toggleSidebar');
  }

  applyFilter(event) {
    this.emitterService.emit('applyFilter', event);
  }

  updateAccounts(accounts) {
    this.accounts = accounts;
  }

  public ngOnDestroy() {
    this.ngDestroy$.next();
  }

}
