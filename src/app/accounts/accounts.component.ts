import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {

  // user accounts array
  accounts = [];

  accountsToMerge = [];

  name = '';

  constructor(private router: Router, private account: AccountService, private activateRoute: ActivatedRoute) {
  }

  ngOnInit() {
    // when this page is redirected from google authentication page fetching token code
    this.activateRoute.queryParams.subscribe(params => {
      if (params['code']) {
        // console.log(params['code'])
        // calling account service method to send this code to server
        this.account.saveToken(params['code'], localStorage.getItem('AddingAccountType')).subscribe((data) => {
          // updating account list
          this.account.getAccounts();
          this.router.navigateByUrl('Dashboard');
        });
      } else {
        this.account.getAccounts();
        this.router.navigateByUrl('Dashboard');
      }
    }, (err: HttpErrorResponse) => {
        alert('Unable to add account');
        console.log(err);
        console.log(err.name);
        console.log(err.message);
        console.log(err.status);
    });

    // setting user account array
    this.account.accountsObservable.subscribe(data => this.accounts = data);

  }

  getIndividualAccounts() {
    return this.accounts.filter(account => !account.merged);
  }

  getMergedAccounts() {
    return this.accounts.filter(account => account.merged);
  }

  updateMergedAccounts(accountId, values) {
    if (values.currentTarget.checked)
      this.accountsToMerge.push(accountId);
    else
      this.accountsToMerge = this.accountsToMerge.filter(id => id !== accountId)
  }

  // method for adding client drive
  addDrive(type) {
    localStorage.setItem('AddingAccountType', type);
    // calling accounts service method for adding a google drive account
    this.account.getAuthLink(type).subscribe((data) => {
      // opening a window for drive link for authentication
      window.open(data['url'], '_self');
    }, (err: HttpErrorResponse) => {
      alert('Shame on us : Server Not responding');
      console.log(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.status);
    });
  }

  // method for removing an account
  removeAccount(id) {
    this.account.deleteAccount(id).subscribe((data) => {
      this.account.getAccounts();
    }, (err: HttpErrorResponse) => {
      alert('Shame on us : Unable to unlink account');
      console.log(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.status);
    });
  }

  mergeAccounts() {
    if (this.accountsToMerge.length >= 2){
      this.account.changeMergeStatus(this.accountsToMerge, true).subscribe((data) => {
        this.account.getAccounts();
        this.accountsToMerge = [];
      } ,(err: HttpErrorResponse) => {
        alert('Shame on us : Unable to merge accounts');
        console.log(err);
        console.log(err.name);
        console.log(err.message);
        console.log(err.status);
      });
    } else
      return alert('Select two or more account to merge!');
    
  }

  demergeAccounts() {
    this.account.changeMergeStatus(this.getMergedAccounts(), false).subscribe((data) => {
      this.account.getAccounts();
      this.accountsToMerge = [];
    }, (err: HttpErrorResponse) => {
      alert('Shame on us : Unable to demerge accounts');
      console.log(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.status);
    });
  }

  getSizeInGb(size){
    return (size/Math.pow(1024,3)).toFixed(2);
  }

  getMergedAccountsStorage(){
    
    var total = 0;
    var used = 0;
    this.getMergedAccounts().forEach(account => {
      total += Number(account.storage.total);
      used += Number(account.storage.used);
    });

    return {used: (used/Math.pow(1024,3)).toFixed(2), total: (total/Math.pow(1024,3)).toFixed(2)};
  }
}

