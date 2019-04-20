import {Component, OnInit} from '@angular/core';
import {HttpClientModule, HttpErrorResponse} from '@angular/common/http';
import {AccountService} from '../services/account.service';

import {sortBy, mapValues} from 'lodash';

import {environment} from '../../environments/environment';
import Swal from "sweetalert2";

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
    fileName: undefined,
    fileSize: undefined
  };
  pageSize = 10;
  page = 1;

  constructor(private account: AccountService, private http: HttpClientModule) {
  }

  ngOnInit() {
    this.account.getSharedFiles().subscribe((data: any[]) => {
      this.files = data;
      this.temp = [...this.files];
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


  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.fileName.toLowerCase().indexOf(val) !== -1 || !val;
    });

    // update the rows
    this.files = temp;
  }

  sortByKey(key) {
    this.files = sortBy(this.files, [function (file) {
      // check if key value isn't undefined in file and if it's value
      // is a string then return lower case value to provide accurate sort
      if (file[`${key}`] && isNaN(file[`${key}`])) {
        return file[`${key}`].toLowerCase();
      }
      else {
        return file[`${key}`];
      }
    }]);
    ;

    if (this.sort[`${key}`]) {
      this.sort[`${key}`] = false;
      return this.files.reverse();
    }
    else {
      // set the rest of sort variables to undefined, so that their arrows aren't showed
      this.sort = mapValues(this.sort, () => undefined);
      this.sort[`${key}`] = true;
      return this.files;
    }
  }

  copyMessage(val: string) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (`${environment.AppEndpoint}/Shared/${val}`));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
    Swal.fire({
      position: 'top-end',
      type: 'success',
      title: 'Link copied to clipboard',
      showConfirmButton: false,
      timer: 1000
    });
  }

  deleteFile(id) {

    Swal.fire({
      title: `Are you sure you want to stop sharing this file?`,
      text: 'You won\'t be able to revert this!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {
        this.account.deleteSharedFile(id).subscribe(() => {
          this.files = this.files.filter((f) => f._id !== id);
          this.temp = [...this.files];
          Swal.fire(
            'Deleted!',
            'Your file has been deleted from sharing.',
            'success'
          );
        }, (err: HttpErrorResponse) => {
          Swal.fire('Error', 'Unable to delete file from sharing', 'error');
          console.log(err);
        });
      }
    });


  }
}
