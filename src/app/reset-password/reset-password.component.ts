import { Component, OnInit } from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  upass;
  ucpass;
  token;

  constructor(private activatedRoute: ActivatedRoute, private user: UserService) { }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params) => {
      this.token = params.id;
    });
  }

  resetPassword(){
    console.log('asdasdas')
    this.user.ResetPassword(this.token, this.upass).subscribe(() => {
      alert('password changed');
    }, (err: HttpErrorResponse) => {
      console.log(err.error);
    });
  }

}
