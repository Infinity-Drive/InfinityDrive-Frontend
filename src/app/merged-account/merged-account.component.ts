import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';

import * as streamSaver from 'streamsaver';
import Swal from 'sweetalert2';
import { sortBy, mapValues, minBy } from 'lodash';

import { environment } from '../../environments/environment';

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
  temp = []; // used for table searching
  sort = {
    name: undefined,
    email: undefined,
    size: undefined,
    modifiedTime: undefined
  };
  pageSize = 10;
  page = 1;

  advancedUpload = true;
  selectedAccounts = []; // accounts where to upload file
  userSettings;

  fileSizeError = false;

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

  guageGraphData = [];
  guageMax = 0;

  standarizeFileData = (items, accountType, accountId) => {

    var standarizedItems = [];
    const showSplitParts = this.userSettings.showSplitParts;

    if (accountType === 'gdrive') {

      items.forEach(item => {
        if ((!showSplitParts && !item.name.includes('.infinitydrive.part')) || showSplitParts) {
          if (item.mimeType === 'application/vnd.google-apps.folder')
            item['mimeType'] = 'folder';

          item['accountType'] = 'gdrive';
          item['account'] = 'Google Drive';
          item['accountId'] = accountId;
          item['size'] = parseInt(item.size);
          standarizedItems.push(item);
        }
      });

    }

    if (accountType === 'odrive') {

      items.forEach(item => {
        if ((!showSplitParts && !item.name.includes('.infinitydrive.part')) || showSplitParts) {
          // item has a file property if its a file and a folder property if its a folder
          item.file ? item['mimeType'] = item.file.mimeType : item['mimeType'] = 'folder';
          item.lastModifiedDateTime ? item['modifiedTime'] = item.lastModifiedDateTime : item['modifiedTime'] = '-';
          item['accountType'] = 'odrive';
          item['account'] = 'OneDrive';
          item['accountId'] = accountId;
          standarizedItems.push(item);
        }

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
        if ((!showSplitParts && !item.name.includes('.infinitydrive.part')) || showSplitParts) {
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
        }
      });

    }
    return standarizedItems;
  };
  errorHandler = (err, fallbackMessage) => {
    const errorMessage = typeof err.error === 'string' ? err.error : fallbackMessage;
    Swal.fire('Error', errorMessage, 'error');
    console.log(err);
    this.uploadProgress = 0;
  };

  constructor(private account: AccountService, private route: Router) {
  }

  ngOnInit() {

    this.userSettings = JSON.parse(localStorage.getItem('infinitySettings'));
    this.accounts = this.account.accounts;

    if (this.accounts.length === 0) {
      this.loading = true;
      this.account.getAccounts().subscribe((data: any) => {
        this.accounts = data;
        this.account.updateAccounts(data);
        if (this.accounts.length === 0) {
          this.route.navigateByUrl('Dashboard/Accounts');
        }
        this.loading = false;
        this.getFiles();
        this.plotGraph();

      }, (err: any) => {
        this.loading = false;
        Swal.fire({
          type: 'error',
          title: 'Error',
          text: 'Can\'t connect to server! Check your internet connection.',
          confirmButtonText: 'Retry'
        }).then((result) => {
          if (result.value) {
            this.ngOnInit();
          }
        });
      });
    } else {
      this.getFiles();
      this.plotGraph();
    }
  }

  refresh() {
    this.accounts = this.account.accounts = [];
    this.barChartLabels = this.barChartData = [];
    this.loading = true;
    this.account.getAccounts().subscribe((data: any) => {
      this.accounts = data;
      this.account.updateAccounts(data);
      if (this.accounts.length === 0) {
        this.route.navigateByUrl('Dashboard/Accounts');
      }
      this.loading = false;
      this.getFiles();
      this.plotGraph();
    }, (err: any) => {
      this.loading = false;
      Swal.fire({
        type: 'error',
        title: 'Error',
        text: 'Can\'t connect to server! Check your internet connection.',
        confirmButtonText: 'Retry'
      }).then((result) => {
        if (result.value) {
          this.refresh();
        }
      });
    });
  }

  getFiles() {
    this.files = [];
    this.loading = true;
    this.breadCrumbs = [];
    this.account.getMergedAccountFiles().subscribe((mergedAccountFiles: any) => {
      mergedAccountFiles.forEach(mergedAccount => {
        this.files.push(...this.standarizeFileData(mergedAccount.files, mergedAccount.accountType, mergedAccount['_id']));
        this.temp = [...this.files];
      });
      this.loading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error === 'No account found!') {
        this.route.navigateByUrl('Dashboard/Accounts');
      } else {
        const errorMessage = err.error ? err.error : 'Error getting files';
        this.loading = false;
        Swal.fire({
          type: 'error',
          title: 'Error',
          text: `${errorMessage}! Check your internet connection.`,
          confirmButtonText: 'Retry'
        }).then((result) => {
          if (result.value) {
            this.getFiles();
          }
        });
      }
    });
  }

  deleteFile(file) {
    Swal.fire({
      title: `Are you sure?`,
      text: `You won\'t be able to recover ${file.name} once deleted!`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {
        this.account.deleteFile(file.accountId, file.id, file.accountType).subscribe((data) => {
          this.files = this.files.filter((f) => f.id !== file.id);
          this.temp = [...this.files];
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
        }, (err: HttpErrorResponse) => this.errorHandler(err, 'Error deleting file'));
      }
    });
  }

  getFolderItems(folder) {
    this.loading = true;

    // for maintaining breadCrumbs
    const currentFolder = this.files.filter(f => f.id === folder.id);

    this.account.getFiles(folder.accountId, folder.accountType, folder.id).subscribe((data) => {
      this.files = this.standarizeFileData(data, folder.accountType, folder.accountId);
      this.temp = [...this.files];
      if (currentFolder.length !== 0)
        this.breadCrumbs.push(currentFolder[0]);
      this.loading = false;
    }, (err: HttpErrorResponse) => this.errorHandler(err, 'Error getting folder items'));
  }

  getDownloadLink(file) {
    this.account.getDownloadUrl(file.accountId, file.id, file.accountType).subscribe((url: string) => {
      window.open(url['downloadUrl'], '_blank');
    }, (err: HttpErrorResponse) => this.errorHandler(err, 'Error downloading file'));
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
    }, (err: HttpErrorResponse) => this.errorHandler(err, 'Error downloading file'));
  }

  getProperties(file) {
    this.account.getProperties(file.accountId, file.id, file.accountType).subscribe((data) => {
      let propertiesString = '';
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          propertiesString += `<b>${key}</b>: ${data[key]} <br>`;
        }
      }
      Swal.fire('Properties', propertiesString, 'success');
    }, (err: HttpErrorResponse) => this.errorHandler(err, 'Error getting file properties'));
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  calculateChunksForSplitUpload(accounts) {
    const accumulatedStorage =
      accounts
        .filter((account) => account.storage.available > 100000000)
        .map((account) => account.storage.available)
        .reduce(function (a, b) { return a + b; }, 0);

    if (accumulatedStorage < this.fileToUpload.size)
      return this.fileSizeError = true;

    let remainingFileSize = this.fileToUpload.size;
    accounts.forEach((account) => {
      if (remainingFileSize != 0) {
        let uploadSize;
        if (remainingFileSize > account.storage.available)
          uploadSize = account.storage.available - 100000000;
        else
          uploadSize = remainingFileSize
        remainingFileSize -= uploadSize;

        account['chunksToUpload'] = Math.ceil((uploadSize / 16000));
      }
    });

    return accounts;
  }

  uploadFile() {

    const uploadHandler = (event) => {

      if (event.type === HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round(100 * event.loaded / event.total);
      }

      else if (event instanceof HttpResponse) {
        this.getFiles();
        this.btnClose.nativeElement.click();
        Swal.fire({
          type: 'success',
          title: 'Successful',
          text: 'File has been uploaded'
        });
        this.uploadProgress = 0;
        this.advancedUpload = false;
        this.selectedAccounts = [];
      }

    };

    // ===== advanced upload =====

    // single account upload
    if (this.selectedAccounts.length === 1) {

      if (this.selectedAccounts[0].storage.available < this.fileToUpload.size) {
        return this.fileSizeError = true;
      }

      this.account.uploadFile(this.selectedAccounts[0]._id, this.selectedAccounts[0].accountType, this.fileToUpload)
        .subscribe(
          (event: any) => uploadHandler(event),
          (err: HttpErrorResponse) => this.errorHandler(err, 'Error uploading file')
        );
    }
    // manual split upload
    else if (this.selectedAccounts.length >= 1) {
      // if more than one accounts selected but the file can fit in a single account, then don't
      // split upload
      var lowestStorageAccount = sortBy(this.selectedAccounts, function (account) {
        return (account.storage.available);
      }).filter((account) => account.storage.available > this.fileToUpload.size);

      if (lowestStorageAccount.length) {
        this.account.uploadFile(lowestStorageAccount[0]._id, lowestStorageAccount[0].accountType, this.fileToUpload)
          .subscribe(
            (event: any) => uploadHandler(event),
            (err: HttpErrorResponse) => this.errorHandler(err, 'Error uploading file')
          );
      }

      // file can't fit in any of individual selected account, we now split upload
      else {
        const accounts = this.calculateChunksForSplitUpload(this.selectedAccounts);
        this.account.splitUpload(this.fileToUpload, accounts).subscribe(
          (event: any) => uploadHandler(event),
          (err: HttpErrorResponse) => this.errorHandler(err, 'Error uploading file')
        );
      }
    }

    // ==============================

    // auto upload (user didn't opt to choose advanced options)
    else {
      var lowestStorageAccount = sortBy(this.accounts, function (account) {
        return (account.storage.available);
      }).filter((account) => account.storage.available > this.fileToUpload.size);

      // upload to the account that has the least storage and can fit the file
      if (lowestStorageAccount.length) {
        this.account.uploadFile(lowestStorageAccount[0]._id, lowestStorageAccount[0].accountType, this.fileToUpload)
          .subscribe(
            (event: any) => uploadHandler(event),
            (err: HttpErrorResponse) => this.errorHandler(err, 'Error uploading file')
          );
      }

      // auto split upload
      else {
        const accounts = this.calculateChunksForSplitUpload(this.accounts);
        this.account.splitUpload(this.fileToUpload, accounts).subscribe(
          (event: any) => uploadHandler(event),
          (err: HttpErrorResponse) => this.errorHandler(err, 'Error uploading file')
        );
      }

    }
  }

  getFilteredAccounts() {
    if (this.accounts.length && this.fileToUpload) {
      return this.accounts;
    }
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

  getAccountEmail(id) {
    const account = this.accounts.find(account => account._id === id);
    if (account) {
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

    // this.barChartLabels.push('Infinity Drive');
    // usedDataSet.push(this.getSizeInGb(used));
    // totalDataSet.push(this.getSizeInGb(total));

    this.barChartData = [
      { data: usedDataSet, label: 'Used' },
      { data: totalDataSet, label: 'Total' }
    ];

    this.guageMax = parseFloat(this.getSizeInGb(total));
    this.guageGraphData = [
      // {
      //   'name': 'Total Storage',
      //   'value': this.getSizeInGb(total)
      // },
      {
        'name': 'Free Storage',
        'value': parseFloat(this.getSizeInGb(total)) - parseFloat(this.getSizeInGb(used))
      },
      {
        'name': 'Used Storage',
        'value': parseFloat(this.getSizeInGb(used))
      },
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

  // method for an account folder navigation
  navigateToAccountFolder(accountId, folderId, foldername) {
    this.route.navigateByUrl(`Dashboard/Storage/${accountId};from=${folderId};folderName=${foldername}`);
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
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

  shareFile(clientFileId, fileName, fileSize, fileType, accountId, accountType) {
    this.account.shareFile(clientFileId, accountId, accountType, fileName, fileSize, fileType, localStorage.getItem('infinityId')).subscribe((data) => {
      // Swal.fire('Share Link', `${environment.AppEndpoint}/Shared/${data}`, 'success');

      this.copyMessage(data);
      Swal.fire({
        title: '<strong>Share Link</strong>',
        type: 'success',
        html:
          // `<i class="fas fa-link point" (click)="copyMessage(${data})" ngbTooltip="Click to file share link"></i>` +
          '<b>Link copied to clipboard</b><br>' +
          `<a href="${environment.AppEndpoint}/Shared/${data}">${environment.AppEndpoint}/Shared/${data}</a> `,
      });

    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Error sharing file';
      Swal.fire('Error', errorMessage, 'error');
      console.log(err);
    });
  }

  selectAccounts(e, account) {
    this.fileSizeError = false;
    e.target.checked ? this.selectedAccounts.push(account) : this.selectedAccounts.splice(this.selectedAccounts.indexOf(account), 1);
  }

  copyMessage(val: string) {
    console.log(val);
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (`${environment.AppEndpoint}/Shared/${val}`));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }

}
