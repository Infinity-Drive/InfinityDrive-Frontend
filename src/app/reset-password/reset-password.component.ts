import { Component, OnInit } from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {UserService} from '../services/user.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  upass = '';
  ucpass = '';
  token;
  loading = false;

  constructor(private activatedRoute: ActivatedRoute, private user: UserService) { }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params) => {
      this.token = params.id;
    });
  }

  resetPassword(){
    this.loading = true;
    this.user.ResetPassword(this.token, this.upass).subscribe(() => {
      this.loading = false;
      Swal.fire('Success', 'Password updated!', 'success');
    }, (err: HttpErrorResponse) => {
      this.loading = false
      Swal.fire('Error', 'Unable to change password', 'error');
    });
  }

}
