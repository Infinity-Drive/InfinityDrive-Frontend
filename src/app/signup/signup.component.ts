import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

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


  constructor(private user: UserService, private  route: Router) { }

  ngOnInit() {
  }

  signUp = function(event, name, email, pass) {
    // overriding html form behaviour
    event.preventDefault();
    // calling add method in  contact service
       this.user.registerUser(email, pass, name).subscribe((data) => {
         localStorage.setItem('infinityGuard', 'yes');
         localStorage.setItem('infinityToken', data.headers.get('x-auth'));
         localStorage.setItem('infinityEmail', data.body['email']);
         localStorage.setItem('infinityId', data.body['_id']);
         localStorage.setItem('infinityName', data.body['name']);
      // navigate user to contact list
      this.route.navigate(['Dashboard']);
    });
  };
}
