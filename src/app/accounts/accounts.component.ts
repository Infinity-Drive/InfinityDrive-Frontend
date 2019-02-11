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
  accounts: any;
  // accounts = [{name : 'One Drive' , account : 'abbasnazar.970@gmail.com'},
  //   {name : 'Out Look' , account : 'abbasnazar.970@outlook.com'},
  //   {name : 'Drop Box' , account : 'abbasnazar.970@gmail.com'}];

  // variable for user name
  name = '';
  constructor(private account: AccountService, private activateRoute: ActivatedRoute) { }

  ngOnInit() {
    // when this page is redirected from google authentication page fetching token code
    this.activateRoute.queryParams.subscribe(params => {
      if (params['code']) {
        console.log(params['code'])
          // calling account service method to send this code to server
          this.account.saveGdriveToken(params['code']).subscribe((data) => {
          // updating account list
          this.getAccountList();
          });
      }
    });
    // setting user name from local storage
     this.name = localStorage.getItem('infinityName');
    // setting user account array
     this.getAccountList();

  }

  // method for adding google drive
  adddGoogleDrive() {
      // calling accounts service method for adding a google drive account
      this.account.getGdriveLink().subscribe((data) => {
        // opening a window for drive link for authentication
        window.open(data['url'], '_self');
      });
  }

  getAccountList() {
        // calling account service method for user account list
         this.account.getAccounts().subscribe((data) => {
              console.log(data);
              this.accounts = data;
        });
  }
}
