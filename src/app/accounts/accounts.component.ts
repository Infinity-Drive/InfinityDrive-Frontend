import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {AccountService} from '../services/account.service';
import {Router, ActivatedRoute} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import Swal from 'sweetalert2';
import { Store } from '@ngrx/store';
import * as AccountActions from './../actions/account.actions';
import { AppState } from '../app.state';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})

export class AccountsComponent implements OnInit {
  // user accounts array
  accounts = [];
  name = '';
  pageSize = 10;
  page = 1;

  constructor(private router: Router,
              private account: AccountService,
              private activateRoute: ActivatedRoute,
              private store: Store<AppState>) {
    this.store.select('account').subscribe(accounts => this.updateAccounts(accounts));
  }


  ngOnInit() {}

  // method for adding client drive
  addDrive(type) {
    localStorage.setItem('AddingAccountType', type);
    // calling accounts service method for adding a google drive account
    this.account.getAuthLink(type).subscribe((data) => {
      window.open(data['url'], '_self');
    }, (err: HttpErrorResponse) => {
      Swal.fire('Shame on us', 'Server Not responding', 'error');
      console.log(err);
    });
  }

  // method for removing an account
  removeAccount(id) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This storage will be removed from your account',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.value) {
        this.account.deleteAccount(id).subscribe((data) => {
          this.store.dispatch(new AccountActions.RemoveAccount(id));
          Swal.fire(
            'Removed!',
            'Storage has been removed successfully',
            'success'
          );
        }, (err: HttpErrorResponse) => {
          Swal.fire('Shame on us', 'Unable to unlink account', 'error');
          console.log(err);
        });
      }
    });
  }

  updateAccounts(accounts) {
    this.accounts = accounts;
  }

  getSizeInGb(size) {
    return (size / Math.pow(1024, 3)).toFixed(2);
  }

  // navigating to respective route
  accountNavigate(accountID) {
    this.router.navigateByUrl(`Dashboard/Storage/${accountID}`);
  }

  // navigating to merged route
  navigateToMerged() {
    this.router.navigateByUrl(`Dashboard/Merged`);
  }

  get loading() {
    return AccountService.isFetchingAccounts;
  }
}

