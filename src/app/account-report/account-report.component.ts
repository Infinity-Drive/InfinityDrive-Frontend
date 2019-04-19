import { Component, OnInit } from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import { UserService } from '../services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-account-report',
  templateUrl: './account-report.component.html',
  styleUrls: ['./account-report.component.css']
})
export class AccountReportComponent implements OnInit {

  loading = true;
  verified = false;

  constructor(private user: UserService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params) => {
      this.user.reportAccount(params.id).subscribe(() => {
        this.loading = false;
        this.verified = true;
      }, (err: HttpErrorResponse) => {
        console.log(err.error)
        this.loading = false;
      });
    });

  }

}
