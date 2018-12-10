import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  uemail = '';
  upass = '';
  constructor(private router: Router, private user: UserService) { }

  ngOnInit() {
  }

  login(event, email, pass) {
    event.preventDefault();
    this.user.authnticateUser(email, pass).subscribe((data) => {
      if (data.headers.get('x-auth')) {
        localStorage.setItem('infinityGuard', 'yes');
        localStorage.setItem('infinityToken', data.headers.get('x-auth'));
        localStorage.setItem('infinityEmail', data.body['email']);
        localStorage.setItem('infinityId', data.body['_id']);
        localStorage.setItem('infinityName', data.body['name']);
        this.router.navigateByUrl('Dashboard');
      } else {
        alert('Wrong Credentials');
      }

    }, (err) => {
      alert('Wrong Credentials');
    });
  }

}
