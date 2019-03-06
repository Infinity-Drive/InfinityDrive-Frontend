import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {AccountService} from '../services/account.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HttpErrorResponse, HttpEventType, HttpResponse} from '@angular/common/http';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-merged-account',
  templateUrl: './merged-account.component.html',
  styleUrls: ['./merged-account.component.css']
})
export class MergedAccountComponent implements OnInit {

  files: any = [];
  loading = false;
  fileToUpload: File = null;
  uploadProgress = 0;
  accounts = [];

  @ViewChild('btnClose') btnClose: ElementRef;


  public pieChartLabels = [];
  public pieChartData = [];
  public pieChartType = 'pie';
  standarizeFileData = (items, accountType, accountId) => {

    var standarizedItems = [];

    if (accountType === 'gdrive') {

      items.forEach(item => {

        if (item.mimeType === 'application/vnd.google-apps.folder')
          item['mimeType'] = 'folder';

        item['accountType'] = 'gdrive';
        item['accountId'] = accountId;
        standarizedItems.push(item);

      });

    }

    if (accountType === 'odrive') {

      items.forEach(item => {
        // item has a file property if its a file and a folder property if its a folder
        item.file ? item['mimeType'] = item.file.mimeType : item['mimeType'] = 'folder';
        item.lastModifiedDateTime ? item['modifiedTime'] = item.lastModifiedDateTime : item['modifiedTime'] = '-';
        item['accountType'] = 'odrive';
        item['accountId'] = accountId;
        standarizedItems.push(item);
      });

    }

    if (accountType === 'dropbox') {

      items.entries.forEach(item => {
        if (item['.tag'] === 'folder')
          item['mimeType'] = 'folder';
        else
          item['mimeType'] = item.name.split('.')[1];

        if (!item['client_modified'])
          item['client_modified'] = '-';

        standarizedItems.push({
          id: item.id,
          name: item.name,
          mimeType: item['mimeType'],
          size: item.size,
          modifiedTime: item['client_modified'],
          accountType: 'dropbox',
          accountId: accountId
        });
      });

    }
    return standarizedItems;
  };

  constructor(private account: AccountService, private route: Router) {
  }

  ngOnInit() {

    this.accounts = this.account.accounts;

    if (this.accounts.length === 0) {
      this.loading = true;
      this.account.getAccounts().subscribe((data: any) => {
        this.accounts = data;
        this.account.accounts = data;
        this.loading = false;
        this.getFiles();
        this.plotGraph();

      }, (err: any) => {
        this.loading = false;
        this.accounts = [];
        this.account.accounts = [];
      });
    } else {
      this.getFiles();
      this.plotGraph();
    }


  }

  getFiles() {
    this.loading = true;
    this.account.getMergedAccountFiles().subscribe((mergedAccountFiles: any) => {
      mergedAccountFiles.forEach(mergedAccount => {
        // console.log(mergedAccount.files, mergedAccount.accountType);
        this.files.push(...this.standarizeFileData(mergedAccount.files, mergedAccount.accountType, mergedAccount['_id']));
      });
      console.log('merged files', this.files);
      this.loading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error === 'No account found!') {
        this.route.navigateByUrl('Dashboard/Accounts');
      } else {
        Swal.fire('Shame on us', err.error, 'error');
        console.log(err);
        console.log(err.name);
        console.log(err.message);
        console.log(err.status);
      }
    });

  }

  deleteFile(file) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {
        this.account.deleteFile(file.accountId, file.id, file.accountType).subscribe((data) => {
          this.files = this.files.filter((f) => f.id !== file.id);
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
        });
      }
    });
  }

  getFolderItems(folder) {
    this.loading = true;
    this.account.getFiles(folder.accountId, folder.accountType, folder.id).subscribe((data) => {
      console.log(data);
      this.files = this.standarizeFileData(data, folder.accountType, folder.accountId);
      // console.log(this.files);
      this.loading = false;
    });
  }

  getDownloadLink(file) {
    this.account.getDownloadUrl(file.accountId, file.id, file.accountType).subscribe((url: string) => {
      window.open(url['downloadUrl'], '_blank');
    }, (err: HttpErrorResponse) => {
      Swal.fire('Shame on us', 'Unable to download file', 'error');
      console.log(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.status);
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadFile() {

    this.account.splitUpload(this.fileToUpload).subscribe((event: any) => {

      if (event.type === HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round(100 * event.loaded / event.total);
      }

      else if (event instanceof HttpResponse) {
        console.log(event.body);
        this.files.push(event.body);
        this.btnClose.nativeElement.click();
        Swal.fire({
          type: 'success',
          title: 'Successful',
          text: 'File has been uploaded'
        });
        this.uploadProgress = 0;
      }
    }, (err: HttpErrorResponse) => {
      Swal.fire('Shame on us', 'Unable to upload file', 'error');
      this.uploadProgress = 0;
      console.log(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.status);
    });
  }

  // method for adding client drive
  addDrive(type) {
    localStorage.setItem('AddingAccountType', type);
    // calling accounts service method for adding a google drive account
    this.account.getAuthLink(type).subscribe((data) => {
      // opening a window for drive link for authentication
      window.open(data['url'], '_self');
    }, (err: HttpErrorResponse) => {
      Swal.fire('Shame on us', 'Server Not responding', 'error');
      console.log(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.status);
    });
  }

  getSizeInMb(size) {
    if (isNaN(size))
      return '-';

    return (Number(size) / Math.pow(1024, 2)).toFixed(2) + ' MB';
  }

  getModifiedTime(isoTime) {
    if (isoTime != '-')
      return new Date(isoTime).toLocaleString();
    return '-';
  }

  getSizeInGb(size) {
    return (size / Math.pow(1024, 3)).toFixed(2);
  }

  plotGraph() {
    let total = 0;
    this.accounts.forEach((value) => {
      this.pieChartLabels.push(value.email);
      this.pieChartData.push(this.getSizeInGb(value.storage.used));
      total = total + parseInt(value.storage.total);
    });
    this.pieChartLabels.push('Total Storage');
    this.pieChartData.push(this.getSizeInGb(total));


  }

}
