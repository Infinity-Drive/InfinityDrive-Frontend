import {Component, OnInit} from '@angular/core';
import {AccountService} from '../services/account.service';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})

export class AccountsComponent implements OnInit {
  // user accounts array
  accounts = [];
  name = '';
  loading = false;

  constructor(private router: Router, private account: AccountService, private activateRoute: ActivatedRoute) {
  }

  ngOnInit() {
    // when this page is redirected from google authentication page fetching token code
    this.activateRoute.queryParams.subscribe(params => {
      if (params['code']) {
        // console.log(params['code'])
        // calling account service method to send this code to server
        this.loading = true;
        this.account.saveToken(params['code'], localStorage.getItem('AddingAccountType')).subscribe((data) => {
          // updating account list
          // this.account.getAccounts();
          this.router.navigateByUrl('Dashboard/Accounts');
        }, (err: HttpErrorResponse) => {
          if (err.error === 'Account already exists') {
            Swal.fire('Account already exists', 'add a different account', 'error');
          } else {
            Swal.fire('Shame on us', 'Unable to add account', 'error');
          }
          this.router.navigateByUrl('Dashboard/Accounts');
          console.log(err);
        });
      } else {
        this.accounts = this.account.accounts;
        if (this.accounts.length === 0) {
          this.loading = true;
          this.account.getAccounts().subscribe((data: any) => {
            this.accounts = data;
            this.account.accounts = data;
            this.loading = false;
          }, (err: any) => {
            this.accounts = [];
            this.account.accounts = [];
          });
        }
        // this.router.navigateByUrl('Dashboard');
      }
    });

    // setting user account array
    // this.account.accountsObservable.subscribe(data => this.accounts = data);

  }
  // method for adding client drive
  addDrive(type) {
    localStorage.setItem('AddingAccountType', type);
    // calling accounts service method for adding a google drive account
    this.account.getAuthLink(type).subscribe((data) => {
      // opening a window for drive link for authentication
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
          this.account.accounts = this.account.accounts.filter(account =>  account['_id'] !== id);
          Swal.fire(
            'Removed!',
            'Storage has been removed successfully',
            'success'
          );
          this.accounts = this.account.accounts;
          // this.account.getAccounts();
        }, (err: HttpErrorResponse) => {
          Swal.fire('Shame on us', 'Unable to unlink account', 'error');
          console.log(err);
        });
      }
    });

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
}

