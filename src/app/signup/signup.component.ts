import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import {HttpErrorResponse} from '@angular/common/http';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  uname = '';
  upass = '';
  uemail = '';
  ucpass = '';
  loading = false;


  constructor(private user: UserService, private  route: Router) { }

  ngOnInit() {
    if (localStorage.getItem('infinityGuard') === 'yes') {
      this.route.navigateByUrl('Dashboard');
    }
  }

  // user signUp function
  signUp = function(event, name, email, pass) {
    // overriding html form behaviour
    event.preventDefault();
    this.loading = true;
    // calling add method in  user service
       this.user.registerUser(email, pass, name).subscribe((data) => {
         // saving user data to local storage for later usage
         // localStorage.setItem('infinityGuard', 'yes');
         // localStorage.setItem('infinityToken', data.headers.get('x-auth'));
         // localStorage.setItem('infinityEmail', data.body['email']);
         // localStorage.setItem('infinityId', data.body['_id']);
         // localStorage.setItem('infinityName', data.body['name']);

         this.loading = false;
         Swal.fire('Account created successfully', 'Verify email to login', 'success');
         this.route.navigateByUrl('');

    }, (err: HttpErrorResponse) => {
         this.loading = false;
         if (err.status === 400) {
           Swal.fire('Shame on us', 'Account creation failed', 'error');
         } else {
           console.log(err);
           console.log(err.name);
           console.log(err.message);
           console.log(err.status);
         }
       });
  };
}
