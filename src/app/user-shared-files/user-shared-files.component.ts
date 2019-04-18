import {Component, OnInit} from '@angular/core';
import {HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import {AccountService} from '../services/account.service';

@Component({
  selector: 'app-user-shared-files',
  templateUrl: './user-shared-files.component.html',
  styleUrls: ['./user-shared-files.component.css']
})
export class UserSharedFilesComponent implements OnInit {

  loading = true;
  files = [];
  temp = []; // used for table searching
  sort = {
    name: undefined,
    email: undefined,
    size: undefined,
    modifiedTime: undefined
  };
  pageSize = 10;
  page = 1;

  constructor(private account: AccountService, private http: HttpClientModule) {
  }

  ngOnInit() {
    this.account.getSharedFiles().subscribe((data: any[]) => {
      this.files = data;
      console.log(data)
      this.loading = false;
    }, (err: HttpErrorResponse) => {
      console.log(err);
    });
  }

  getSizeInMb(size) {
    if (isNaN(size))
      return '-';
    else
      return (Number(size) / Math.pow(1024, 2)).toFixed(2) + ' MB';
  }

}
