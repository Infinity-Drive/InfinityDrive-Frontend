import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AccountService} from '../../services/account.service';
import {ActivatedRoute} from '@angular/router';
import {HttpErrorResponse, HttpEventType, HttpResponse} from '@angular/common/http';

import Swal from 'sweetalert2';
import {Location} from '@angular/common';
import {sortBy, mapValues} from 'lodash';

import { fireErrorDialog, fireSuccessToast, fireConfirmationDialog, fireSuccessDialog } from '../../shared/utils/alerts';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {

  files;
  accountId;
  currentAccount;
  // user accounts array
  accounts = [];
  fileToUpload: File = null;
  uploadProgress = 0;
  loading = false;
  breadCrumbs = [];
  from = false;
  temp = []; // used for table searching
  sort = {
    name: undefined,
    email: undefined,
    size: undefined,
    modifiedTime: undefined
  };
  pageSize = 10;
  page = 1;

  userSettings;

  @ViewChild('btnClose') btnClose: ElementRef;
  standarizeFileData = (items, accountType) => {

    var standarizedItems = [];
    const showSplitParts = this.userSettings.showSplitParts;

    if (accountType === 'gdrive') {
      items.forEach(item => {
        if ((!showSplitParts && !item.name.includes('.infinitydrive.part')) || showSplitParts) {
          if (item.mimeType === 'application/vnd.google-apps.folder')
            item['mimeType'] = 'folder';
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
          standarizedItems.push(item);
        }
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
            modifiedTime: item['client_modified']
          });
        }
      });
    }
    return standarizedItems;
  };

  constructor(private account: AccountService, private activeRoute: ActivatedRoute, private location: Location) {
  }

  ngOnInit() {
    this.userSettings = JSON.parse(localStorage.getItem('infinitySettings'));
    this.activeRoute.params.subscribe((params) => {
      this.accountId = params.id;
      // this.account.accountsObservable.subscribe(data => this.accounts = data);

      if (params['from']) {
        this.from = true;
        console.log(params['folderName']);
        this.location.replaceState(`Dashboard/Storage/${params['id']}`);
      }
      this.accounts = this.account.accounts;

      if (this.accounts.length === 0) {
        this.loading = true;
        this.account.getAccounts().subscribe((data: any) => {
          this.accounts = data;
          this.account.updateAccounts(data);
          this.loading = false;
          this.currentAccount = this.accounts.find(account => account['_id'] === this.accountId);

          if (this.from && params['from'] != 'root') {
            this.getFolderItems(params['from'], params['folderName']);
          } else {
            this.getFiles(this.accountId);
          }

        }, (err: any) => {
          this.loading = false;
          fireErrorDialog('Can\'t connect to server! Check your internet connection.', 'Retry').then((result) => {
            if (result.value) {
              this.ngOnInit();
            }
          });
        });
      } else {
        this.currentAccount = this.accounts.find(account => account['_id'] === this.accountId);
        if (this.from && params['from'] != 'root') {
          this.getFolderItems(params['from'], params['folderName']);
        } else {
          this.getFiles(this.accountId);
        }
      }

    });
  }

  getFiles(id) {
    this.loading = true;
    this.breadCrumbs = [];
    this.account.getFiles(id, this.currentAccount['accountType']).subscribe((data) => {
      // console.log(data);
      this.files = this.standarizeFileData(data, this.currentAccount['accountType']);
      this.temp = [...this.files];
      this.loading = false;
      // console.log(this.files);
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Unable to get files';
      this.loading = false;
      fireErrorDialog(`${errorMessage}! Check your internet connection.`, 'Retry').then((result) => {
        if (result.value) {
          this.getFiles(this.accountId);
        }
      });
    });
  }

  getDownloadLink(Fileid) {
    this.account.getDownloadUrl(this.accountId, Fileid, this.currentAccount['accountType']).subscribe((url: string) => {
      window.open(url['downloadUrl'], '_blank');
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Unable to download file';
      fireErrorDialog(errorMessage);
      console.log(err);
    });
  }

  getFolderItems(folderId, folderName = undefined) {
    this.loading = true;

    // for maintaining breadCrumbs
    let currentFolder;
    if (folderName) {
      currentFolder = [{'name': folderName, 'id': folderId}];
    } else {
      currentFolder = this.files.filter(f => f.id === folderId);
    }

    this.account.getFiles(this.accountId, this.currentAccount['accountType'], folderId).subscribe((data) => {
      console.log(data);
      this.files = this.standarizeFileData(data, this.currentAccount['accountType']);
      this.temp = [...this.files];
      if (currentFolder.length !== 0)
        this.breadCrumbs.push(currentFolder[0]);
      this.loading = false;
      // console.log(this.files);
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Unable to get files';
      fireErrorDialog(errorMessage);
      this.loading = false;
      console.log(err);
    });
  }

  deleteFile(file) {
    fireConfirmationDialog(`You won\'t be able to recover ${file.name} once deleted!`).then((result) => {
      if (result.value) {
        this.account.deleteFile(this.accountId, file.id, this.currentAccount['accountType']).subscribe((data) => {
          this.files = this.files.filter((f) => f.id !== file.id);
          this.temp = [...this.files];
          fireSuccessToast('The file has been deleted');
        }, (err: HttpErrorResponse) => {
          const errorMessage = err.error ? err.error : 'Unable to delete file';
          fireErrorDialog(errorMessage);
          console.log(err);
        });
      }
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadFile() {
    this.account.uploadFile(this.accountId, this.currentAccount['accountType'], this.fileToUpload,
      this.getCurrentFolderId(), this.getCurrentPath()).subscribe((event: any) => {

      if (event.type === HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round(100 * event.loaded / event.total);
      }

      else if (event instanceof HttpResponse) {
        if (this.getCurrentFolderId() == 'root') {
          this.getFiles(this.accountId);
        }
        else {
          this.getFolderItems(this.getCurrentFolderId());
        }
        this.btnClose.nativeElement.click();
        fireSuccessToast('File has been uploaded');
        this.uploadProgress = 0;
      }

    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Unable to upload file';
      fireErrorDialog(errorMessage);
      console.log(err);
      this.uploadProgress = 0;
    });
  }

  createFolder() {
    Swal.fire({
      title: 'New folder',
      input: 'text',
      confirmButtonText: 'Create',
      // inputValue: inputValue,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Folder name can\'t be empty';
        }
        this.account.createFolder(this.accountId, value, this.currentAccount['accountType'],
          this.getCurrentFolderId(), this.getCurrentPath()).subscribe((item: any) => {
          this.files.push(item);
          this.temp = [...this.files];
          fireSuccessToast('Folder created');
        }, (err: HttpErrorResponse) => {
          const errorMessage = err.error ? err.error : 'Unable to create folder';
          fireErrorDialog(errorMessage);
          console.log(err);
        });
      }
    });
  }

  getProperties(file) {
    this.account.getProperties(this.accountId, file.id, this.currentAccount.accountType).subscribe((data) => {
      let propertiesString = '';
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          propertiesString += `<b>${key}</b>: ${data[key]} <br>`;
        }
      }
      fireSuccessDialog(propertiesString, 'Properties');
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Error getting file properties';
      fireErrorDialog(errorMessage);
      console.log(err);
    });
  }

  getCurrentFolderId() {
    return this.breadCrumbs.length !== 0 ? this.breadCrumbs[this.breadCrumbs.length - 1].id : 'root';
  }

  getCurrentPath() {
    let path = '/';
    if (this.breadCrumbs.length !== 0) {
      this.breadCrumbs.forEach(crumb => {
        path += `${crumb.name}/`;
      });
    }
    return path;
  }

  getSizeInMb(size) {
    if (isNaN(size))
      return '-';
    else
      return (Number(size) / Math.pow(1024, 2)).toFixed(2) + ' MB';
  }

  getModifiedTime(isoTime) {
    if (isoTime != '-')
      return new Date(isoTime).toLocaleString();
    return '-';
  }

  // handling breadcrumb navigation
  breadCrumbNavigation(id, index) {
    this.getFolderItems(id);
    this.breadCrumbs.splice(index + 1);
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

  shareFile(clientFileId, fileName, fileSize, fileType) {
    this.account.shareFile(clientFileId, this.accountId, this.currentAccount['accountType'], fileName, fileSize, fileType, localStorage.getItem('infinityId')).subscribe((data) => {
      this.copyMessage(data);
      fireSuccessDialog('Link copied to clipboard');
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Error sharing file';
      fireErrorDialog(errorMessage);
      console.log(err);
    });
  }

  copyMessage(val: string) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
      e.clipboardData.setData('text/plain', (`${environment.AppEndpoint}/Shared/${val}`));
      e.preventDefault();
      document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
  }
}
