import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../../services/user.service';
import {HttpErrorResponse} from '@angular/common/http';

import Swal from 'sweetalert2';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // variable for TwoWayBinding for form
  uemail = '';
  upass = '';
  loading = false;

  // injecting router and UserService
  constructor(private router: Router, private user: UserService) {
  }

  ngOnInit() {
    if (localStorage.getItem('infinityGuard') === 'yes') {
      this.router.navigateByUrl('Dashboard');
    }
  }

  // login method
  login(event, email, pass) {
    // to prevent page refresh on login button
    event.preventDefault();
    this.loading = true;
    // calling authenticate method in userService to authenticate user
    this.user.authenticateUser(email, pass).subscribe((data) => {
      // if header is returned then the user exsist
      if (data.headers.get('x-auth')) {
        // setting value to yes which means that the user is logged in and can access all routes
        localStorage.setItem('infinityGuard', 'yes');
        // saving token to local storage
        localStorage.setItem('infinityToken', data.headers.get('x-auth'));
        // saving user email to localstorage for later usage
        localStorage.setItem('infinityEmail', data.body['email']);
        // saving user id to locaalstorage for later usage
        localStorage.setItem('infinityId', data.body['_id']);
        // saving user name to localstorage for later usage
        localStorage.setItem('infinityName', data.body['name']);
        localStorage.setItem('infinitySettings', JSON.stringify(data.body['settings']));
        // localStorage.setItem('infinityUsername', data.body['name']);
        // navgating user to dashboard after successful login
        this.router.navigateByUrl('Dashboard');
      }
    }, (err: HttpErrorResponse) => {
      if (err.status === 401) {
        this.loading = false;
        Swal.fire('User does not exist!', 'Invalid email or password', 'error');
      } else {
        console.log(err);
        console.log(err.name);
        console.log(err.message);
        console.log(err.status);
      }
    });
  }

}
