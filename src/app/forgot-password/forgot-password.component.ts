import {Component, OnInit} from '@angular/core';
import {UserService} from '../services/user.service';
import {HttpErrorResponse} from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  uemail;
  loading = false;

  constructor(private user: UserService) {
  }

  ngOnInit() {
  }

  requestResetPassword() {
    this.loading = true;
    this.user.requestResetPassword(this.uemail).subscribe((data) => {
      this.loading = false;
      Swal.fire('Successful', 'Reset Password link has been sent to you email', 'success');
    }, (err) => {
      this.loading = false;
      console.log(err);
      Swal.fire('Error', 'Cannot find this email', 'error');
    });
  }

}
