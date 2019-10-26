import {Component, OnInit} from '@angular/core';

import {ActivatedRoute} from '@angular/router';
import {UserService} from '../../services/user.service';
import {HttpErrorResponse} from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent implements OnInit {
  loading = true;
  verified = false;

  constructor(private activatedRoute: ActivatedRoute, private user: UserService) {
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params) => {
      this.user.verifyEmail(params.id).subscribe(() => {
        this.loading = false;
        this.verified = true;
      }, (err: HttpErrorResponse) => {
        console.log(err.error)
        this.loading = false;
      });
    });
  }

}
