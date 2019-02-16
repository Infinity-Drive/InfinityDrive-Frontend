import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {

  // user accounts array
  accounts = [];
  // accounts = [{name : 'One Drive' , account : 'abbasnazar.970@gmail.com'},
  //   {name : 'Out Look' , account : 'abbasnazar.970@outlook.com'},
  //   {name : 'Drop Box' , account : 'abbasnazar.970@gmail.com'}];

  // variable for user name
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
    });
    // setting user name from local storage
    this.name = localStorage.getItem('infinityName');
    // setting user account array


      this.account.accountsObservable.subscribe(data => this.accounts = data);

  }

  // method for adding client drive
  addDrive(type) {
    localStorage.setItem('AddingAccountType', type);
    // calling accounts service method for adding a google drive account
    this.account.getAuthLink(type).subscribe((data) => {
      // opening a window for drive link for authentication
      window.open(data['url'], '_self');
    });
  }

  // method for removing an account
  removeAccount(id) {
    this.account.deleteAccount(id).subscribe((data) => {
      this.account.getAccounts();
    });
  }



}

