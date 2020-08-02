import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';

import * as streamSaver from 'streamsaver';
import Swal from 'sweetalert2';
import { sortBy, mapValues, minBy } from 'lodash';

import { Store } from '@ngrx/store';
import * as FileActions from '../../actions/file.actions';
import { AppState } from '../../app.state';

import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { EmitterService } from '../../services/emitter.service';

@Component({
  selector: 'app-merged-account',
  templateUrl: './merged-account.component.html',
  styleUrls: ['./merged-account.component.css']
})
export class MergedAccountComponent implements OnInit,OnDestroy {

  displayedColumns: string[] = ['name', 'modifiedTime', 'size', 'action'];
  dataSource;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  files: any = [];
  fileToUpload: File = null;
  uploadProgress = 0;
  accounts = [];
  breadCrumbs = [];
  temp = []; // used for table searching
  pageSize = 10;
  page = 1;

  advancedUpload = true;
  selectedAccounts = []; // accounts where to upload file
  userSettings;

  fileSizeError = false;
  public ngDestroy$ = new Subject();

  @ViewChild('btnClose', { static: true }) btnClose: ElementRef;


  constructor(
    private account: AccountService,
    private route: Router,
    private store: Store<AppState>,
    private emitterService: EmitterService) {
  }

  ngOnInit() {
    this.userSettings = JSON.parse(localStorage.getItem('infinitySettings'));
    this.store.select('account').pipe(takeUntil(this.ngDestroy$)).subscribe(accounts => this.updateAccounts(accounts));
    this.store.select('file').pipe(takeUntil(this.ngDestroy$)).subscribe(files => {
      this.updateFiles(files)
      this.dataSource = new MatTableDataSource(files);
      this.dataSource.sort = this.sort;
    });

    this.emitterService.emitter.pipe(takeUntil(this.ngDestroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case 'applyFilter':
          return this.applyFilter(emitted.data);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getFiles() {
    this.files = [];
    AccountService.isFetchingFiles = true;
    this.breadCrumbs = [];
    this.account.getMergedAccountFiles().subscribe((files: any) => {
      this.store.dispatch(new FileActions.SetMergedFiles(files));
      AccountService.isFetchingFiles = false;
      AccountService.hasFetchedAllFiles = true;
    }, (err: HttpErrorResponse) => {
      if (err.error === 'No account found!') {
        this.route.navigateByUrl('Dashboard/Accounts');
      } else {
        const errorMessage = err.error ? err.error : 'Error getting files';
        AccountService.isFetchingFiles = false;
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
          this.store.dispatch(new FileActions.RemoveFile(file.id));
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
    AccountService.isFetchingFiles = true;

    // for maintaining breadCrumbs
    const currentFolder = this.files.filter(f => f.id === folder.id);

    this.account.getFiles(folder.accountId, folder.accountType, folder.id).subscribe((files) => {
      this.files = files;
      if (currentFolder.length !== 0)
        this.breadCrumbs.push(currentFolder[0]);
        AccountService.isFetchingFiles = false;
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
    // we remove the accounts that don't won't be used to split upload,
    // i.e. chunksToUpload not set
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
      if (!this.userSettings.forceEqualSplit) {
        console.log('asudh')
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

        else {
          const accounts = this.calculateChunksForSplitUpload(this.selectedAccounts);
          this.account.splitUpload(this.fileToUpload, accounts).subscribe(
            (event: any) => uploadHandler(event),
            (err: HttpErrorResponse) => this.errorHandler(err, 'Error uploading file')
          );
        }

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

      if (!this.userSettings.forceEqualSplit) {
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

        else {
          const accounts = this.calculateChunksForSplitUpload(this.selectedAccounts);
          this.account.splitUpload(this.fileToUpload, accounts).subscribe(
            (event: any) => uploadHandler(event),
            (err: HttpErrorResponse) => this.errorHandler(err, 'Error uploading file')
          );
        }
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

  errorHandler = (err, fallbackMessage) => {
    const errorMessage = typeof err.error === 'string' ? err.error : fallbackMessage;
    Swal.fire('Error', errorMessage, 'error');
    console.log(err);
    this.uploadProgress = 0;
  }

  updateAccounts(accounts) {
    this.accounts = accounts;
  }

  updateFiles(files) {
    this.files = files;
    if (!files.length) {
      this.getFiles();
    }
  }

  get loading () {
    return AccountService.isFetchingAccounts || AccountService.isFetchingFiles;
  }

  public ngOnDestroy() {
    this.ngDestroy$.next();
  }
}
