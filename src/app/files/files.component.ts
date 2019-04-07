import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';

import Swal from 'sweetalert2';
import { Location } from '@angular/common';

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

  @ViewChild('btnClose') btnClose: ElementRef;

  constructor(private account: AccountService, private activeRoute: ActivatedRoute, private location: Location) {
  }

  ngOnInit() {
    this.activeRoute.params.subscribe((params) => {
      this.accountId = params.id;
      // this.account.accountsObservable.subscribe(data => this.accounts = data);

      if (params['from']) {
        this.from = true;
        console.log(this.from)
        this.location.replaceState(`Dashboard/Storage/${params['id']}`);
      }
      this.accounts = this.account.accounts;

      if (this.accounts.length === 0) {
        this.loading = true;
        this.account.getAccounts().subscribe((data: any) => {
          this.accounts = data;
          this.account.accounts = data;
          this.loading = false;
          this.currentAccount = this.accounts.find(account => account['_id'] === this.accountId);
          this.getfiles(params.id);

        }, (err: any) => {
          this.loading = false;
          Swal.fire({
            type: 'error',
            title: 'Oops...',
            text: 'Can\'t connect to server! Check your internet connection.',
            confirmButtonText: 'Retry'
          }).then((result) => {
            if (result.value) {
              this.ngOnInit();
            }
          });
        });
      } else {
        this.currentAccount = this.accounts.find(account => account['_id'] === this.accountId);
        this.getfiles(params.id);
      }

    });
  }

  getfiles(id) {
    this.loading = true;
    this.breadCrumbs = [];
    this.account.getFiles(id, this.currentAccount['accountType']).subscribe((data) => {
      console.log(data);
      this.files = this.standarizeFileData(data, this.currentAccount['accountType']);
      this.loading = false;
      // console.log(this.files);
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Unable to get files';
      Swal.fire('Error', errorMessage, 'error');
      this.loading = false;
      console.log(err);
    });
  }

  getDownloadLink(Fileid) {
    this.account.getDownloadUrl(this.accountId, Fileid, this.currentAccount['accountType']).subscribe((url: string) => {
      window.open(url['downloadUrl'], '_blank');
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Unable to download file';
      Swal.fire('Error', errorMessage, 'error');
      console.log(err);
    });
  }

  getFolderItems(folderId) {
    this.loading = true;

    // for maintaining breadCrumbs
    const currentFolder = this.files.filter(f => f.id === folderId);

    this.account.getFiles(this.accountId, this.currentAccount['accountType'], folderId).subscribe((data) => {
      console.log(data);
      this.files = this.standarizeFileData(data, this.currentAccount['accountType']);
      if (currentFolder.length !== 0)
        this.breadCrumbs.push(currentFolder[0]);
      this.loading = false;
      // console.log(this.files);
    }, (err: HttpErrorResponse) => {
      const errorMessage = err.error ? err.error : 'Unable to get files';
      Swal.fire('Error', errorMessage, 'error');
      this.loading = false;
      console.log(err);
    });
  }

  deleteFile(file) {

    Swal.fire({
      title: `Are you sure you want to delete ${file.name}?`,
      text: 'You won\'t be able to revert this!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.value) {
        this.account.deleteFile(this.accountId, file.id, this.currentAccount['accountType']).subscribe((data) => {
          this.files = this.files.filter((f) => f.id !== file.id);
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
        }, (err: HttpErrorResponse) => {
          const errorMessage = err.error ? err.error : 'Unable to delete file';
          Swal.fire('Error', errorMessage, 'error');
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
          this.getfiles(this.accountId);
          this.btnClose.nativeElement.click();
          Swal.fire({
            type: 'success',
            title: 'Successful',
            text: 'File has been uploaded'
          });
          this.uploadProgress = 0;
        }

      }, (err: HttpErrorResponse) => {
        const errorMessage = err.error ? err.error : 'Unable to upload file';
        Swal.fire('Error', errorMessage, 'error');
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
            Swal.fire({
              type: 'success',
              title: 'Successful',
              text: 'Folder created'
            });
          }, (err: HttpErrorResponse) => {
            const errorMessage = err.error ? err.error : 'Unable to create folder';
            Swal.fire('Error', errorMessage, 'error');
            console.log(err);
          });
      }
    })
  }

  getCurrentFolderId() {
    return this.breadCrumbs.length !== 0 ? this.breadCrumbs[this.breadCrumbs.length - 1].id : 'root';
  }

  getCurrentPath() {
    let path = '/'
    if (this.breadCrumbs.length !== 0) {
      this.breadCrumbs.forEach(crumb => {
        path += `${crumb.name}/`
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

  standarizeFileData = (items, accountType) => {

    var standarizedItems = [];

    if (accountType === 'gdrive') {
      items.forEach(item => {
        if (!item.name.includes('.infinitydrive.part')) {
          if (item.mimeType === 'application/vnd.google-apps.folder')
            item['mimeType'] = 'folder';
          standarizedItems.push(item);
        }
      });
    }

    if (accountType === 'odrive') {
      items.forEach(item => {
        if (!item.name.includes('.infinitydrive.part')) {
          // item has a file property if its a file and a folder property if its a folder
          item.file ? item['mimeType'] = item.file.mimeType : item['mimeType'] = 'folder';
          item.lastModifiedDateTime ? item['modifiedTime'] = item.lastModifiedDateTime : item['modifiedTime'] = '-';
          standarizedItems.push(item);
        }
      });
    }

    if (accountType === 'dropbox') {
      items.entries.forEach(item => {
        if (!item.name.includes('.infinitydrive.part')) {
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

}
