import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';

import * as streamSaver from 'streamsaver';
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
  breadCrumbs = [];

  @ViewChild('btnClose') btnClose: ElementRef;

  public barChartLabels = [];
  public barChartData = [];
  public barChartType = 'horizontalBar';
  public barChartOptions = {
    title: {
      text: 'Storage Usage (GB)',
      display: true
    },
    scales: {
      xAxes: [{
        ticks: {
          // Include a dollar sign in the ticks
          callback: function (value, index, values) {
            return value + ' GB';
          }
        }
      }]
    },
    maintainAspectRatio: false
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
        if (this.accounts.length === 0) {
          this.route.navigateByUrl('Dashboard/Accounts');
        }
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
    this.files = [];
    this.loading = true;
    this.breadCrumbs = [];
    this.account.getMergedAccountFiles().subscribe((mergedAccountFiles: any) => {
      mergedAccountFiles.forEach(mergedAccount => {
        this.files.push(...this.standarizeFileData(mergedAccount.files, mergedAccount.accountType, mergedAccount['_id']));
      });
      this.loading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error === 'No account found!') {
        this.route.navigateByUrl('Dashboard/Accounts');
      } else {
        const errorMessage = err.error ? err.error : 'Error getting files';
        Swal.fire('Error', errorMessage, 'error');
        console.log(err);
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
        }, (err: HttpErrorResponse) => {
          const errorMessage = err.error ? err.error : 'Error deleting file';
          Swal.fire('Error', errorMessage, 'error');
          console.log(err);
        });
      }
    });
  }

  getFolderItems(folder) {
    this.loading = true;

    // for maintaining breadCrumbs
    const currentFolder = this.files.filter(f => f.id === folder.id);

    this.account.getFiles(folder.accountId, folder.accountType, folder.id).subscribe((data) => {
      this.files = this.standarizeFileData(data, folder.accountType, folder.accountId);
      // console.log(this.files);
      if (currentFolder.length !== 0)
        this.breadCrumbs.push(currentFolder[0]);
      this.loading = false;
    }, (err: HttpErrorResponse) => {
      Swal.fire('Error', err.error, 'error');
      console.log(err);
    });
  }

  getDownloadLink(file) {
    this.account.getDownloadUrl(file.accountId, file.id, file.accountType).subscribe((url: string) => {
      window.open(url['downloadUrl'], '_blank');
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Error downloading file';
      Swal.fire('Error', errorMessage, 'error');
      console.log(err);
    });
  }

  getDownloadStream(file) {
    this.account.downloadStream(file.id, file.accountType).then(res => {

      const fileStream = streamSaver.createWriteStream(file.name, file.size);
      const writer = fileStream.getWriter();

      // more optimized
      if (res.body.pipeTo) {
        // like as we never did fileStream.getWriter()
        writer.releaseLock();
        return res.body.pipeTo(fileStream);
      }

      const reader = res.body.getReader();
      const pump = () => reader.read()
        .then(({ value, done }) => done
          // close the stream so we stop writing
          ? writer.close()
          // Write one chunk, then get the next one
          : writer.write(value).then(pump)
        );

      // Start the reader
      pump().then(() =>
        console.log('Closed the stream, Done writing')
      );
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Error downloading file';
      Swal.fire('Error', errorMessage, 'error');
      console.log(err);
    });
  }

  getProperties(file) {
    this.account.getProperties(file.accountId, file.id, file.accountType).subscribe((data) => {
      console.table(data);
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Error getting file properties';
      Swal.fire('Error', errorMessage, 'error');
      console.log(err);
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadFile() {

    this.account.splitUpload(this.fileToUpload).subscribe((data: any) => {

      if (data.type === HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round(100 * data.loaded / data.total);
      }

      else if (data instanceof HttpResponse) {
        // if we're getting a mongo object id we need to assign it to id
        // since, we're always interpreting ids with .id
        if (data.body._id)
          data.body.id = data.body._id;
        console.log(data.body);
        this.files.push(data.body);
        this.btnClose.nativeElement.click();
        Swal.fire({
          type: 'success',
          title: 'Successful',
          text: 'File has been uploaded'
        });
        this.uploadProgress = 0;
      }
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Error uploading file';
      Swal.fire('Error', errorMessage, 'error');
      this.uploadProgress = 0;
      console.log(err);
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
      const errorMessage = err.error ? err.error : 'Error adding account';
      Swal.fire('Error', errorMessage, 'error');
      console.log(err);
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

  getAccountEmail(id){
    const account = this.accounts.find(account => account._id === id);
    if(account){
      return account.email;
    }
    return '-';
  }

  plotGraph() {
    let usedDataSet = [];
    let totalDataSet = [];
    let total = 0;
    let used = 0;
    this.accounts.forEach((value) => {
      this.barChartLabels.push(`${value.account}(${value.email.split('@')[0]})`);
      usedDataSet.push(this.getSizeInGb(value.storage.used));
      totalDataSet.push(this.getSizeInGb(value.storage.total));
      total += parseInt(value.storage.total);
      used += parseInt(value.storage.used);
    });

    this.barChartLabels.push('Infinity Drive');
    usedDataSet.push(this.getSizeInGb(used));
    totalDataSet.push(this.getSizeInGb(total));

    this.barChartData = [
      { data: usedDataSet, label: 'Used' },
      { data: totalDataSet, label: 'Total' }
    ];

  }

  // handling breadcrumb navigation
  breadCrumbNavigation(folder, index) {
    this.getFolderItems(folder);
    this.breadCrumbs.splice(index + 1);
  }

  // method for account navigation
  navigateToAccount(id) {
    this.route.navigateByUrl(`Dashboard/Storage/${id};from=root`);
  }

  standarizeFileData = (items, accountType, accountId) => {

    var standarizedItems = [];

    if (accountType === 'gdrive') {

      items.forEach(item => {

        if (item.mimeType === 'application/vnd.google-apps.folder')
          item['mimeType'] = 'folder';

        item['accountType'] = 'gdrive';
        item['account'] = 'Google Drive';
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
        item['account'] = 'OneDrive';
        item['accountId'] = accountId;
        standarizedItems.push(item);
      });

    }

    if (accountType === 'merged') {
      items.forEach(item => {
        item['id'] = item._id;
        item['accountType'] = 'merged';
        item['account'] = 'Merged';
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
          account: 'Dropbox',
          accountId: accountId
        });
      });

    }
    return standarizedItems;
  };

}
