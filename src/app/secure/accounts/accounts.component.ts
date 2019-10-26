import {Component, EventEmitter, OnInit, Output, OnDestroy} from '@angular/core';
import {AccountService} from '../../services/account.service';
import {Router, ActivatedRoute} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import { Store } from '@ngrx/store';
import * as AccountActions from '../../actions/account.actions';
import { AppState } from '../../app.state';
import { fireErrorDialog, fireSuccessToast, fireConfirmationDialog } from '../../shared/utils/alerts';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})

export class AccountsComponent implements OnInit, OnDestroy {
  // user accounts array
  accounts = [];
  name = '';
  pageSize = 10;
  page = 1;
  public ngDestroy$ = new Subject();


  constructor(private router: Router,
              private account: AccountService,
              private activateRoute: ActivatedRoute,
              private store: Store<AppState>) {
  }


  ngOnInit() {
    this.store.select('account').pipe(takeUntil(this.ngDestroy$)).subscribe(accounts => this.updateAccounts(accounts));
  }

  // method for adding client drive
  addDrive(type) {
    localStorage.setItem('AddingAccountType', type);
    // calling accounts service method for adding a google drive account
    this.account.getAuthLink(type).subscribe((data) => {
      window.open(data['url'], '_self');
    }, (err: HttpErrorResponse) => {
      fireErrorDialog('Server Not responding');
      console.log(err);
    });
  }

  // method for removing an account
  removeAccount(id) {
    fireConfirmationDialog('The storage will be removed from your account').then((result) => {
      if (result.value) {
        this.account.deleteAccount(id).subscribe((data) => {
          this.store.dispatch(new AccountActions.RemoveAccount(id));
          fireSuccessToast('Account removed!');
        }, (err: HttpErrorResponse) => {
          fireErrorDialog('Unable to unlink account');
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

  public ngOnDestroy() {
    this.ngDestroy$.next();
  }

}

