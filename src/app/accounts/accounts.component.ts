import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  accounts: any;
  // accounts = [{name : 'One Drive' , account : 'abbasnazar.970@gmail.com'},
  //   {name : 'Out Look' , account : 'abbasnazar.970@outlook.com'},
  //   {name : 'Drop Box' , account : 'abbasnazar.970@gmail.com'}];
  name = '';
  constructor(private account: AccountService, private activateRoute: ActivatedRoute) { }

  ngOnInit() {

    this.activateRoute.queryParams.subscribe(params => {
      if (params['code']) {
        console.log(params['code'])
          this.account.saveGdriveToken(params['code']).subscribe((data) => {
            this.getAccountList();
          });
      }
    });
     this.name = localStorage.getItem('infinityName');
    this.getAccountList();

  }

  adddGoogleDrive() {
      this.account.getGdriveLink().subscribe((data) => {
        window.open(data['url'], '_self');
      });
  }

  getAccountList() {

         this.account.getAccounts().subscribe((data) => {
              console.log(data);
              this.accounts = data;
        });
  }
}
