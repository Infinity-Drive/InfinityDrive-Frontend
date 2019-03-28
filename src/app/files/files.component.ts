import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AccountService} from '../services/account.service';
import {ActivatedRoute} from '@angular/router';
import {HttpErrorResponse, HttpEventType, HttpResponse} from '@angular/common/http';

import Swal from 'sweetalert2';

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

  @ViewChild('btnClose') btnClose: ElementRef;
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

  constructor(private account: AccountService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.params.subscribe((params) => {
      this.accountId = params.id;
      // this.account.accountsObservable.subscribe(data => this.accounts = data);

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
          this.accounts = [];
          this.account.accounts = [];
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
      Swal.fire('Shame on us', 'Unable to getfiles', 'error');
      this.loading = false;
      console.log(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.status);
    });
  }

  getDownloadLink(Fileid) {
    this.account.getDownloadUrl(this.accountId, Fileid, this.currentAccount['accountType']).subscribe((url: string) => {
      window.open(url['downloadUrl'], '_blank');
    }, (err: HttpErrorResponse) => {
      Swal.fire('Shame on us', 'Unable to download file', 'error');
      console.log(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.status);
    });
  }

  getFolderItems(folderId) {
    this.loading = true;

    // for maintaining breadCrumbs
    const currentFolder = this.files.filter((f) => {
      if (f.id === folderId) {
        return f;
      }

    });

    this.account.getFiles(this.accountId, this.currentAccount['accountType'], folderId).subscribe((data) => {
      console.log(data);
      this.files = this.standarizeFileData(data, this.currentAccount['accountType']);
      if (currentFolder.length !== 0)
        this.breadCrumbs.push(currentFolder[0]);
      this.loading = false;
      // console.log(this.files);
    }, (err: HttpErrorResponse) => {
      Swal.fire('Shame on us', 'Unable to get files', 'error');
      this.loading = false;
      console.log(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.status);
    });
  }

  deleteFile(Fileid) {

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
        this.account.deleteFile(this.accountId, Fileid, this.currentAccount['accountType']).subscribe((data) => {
          this.files = this.files.filter((f) => f.id !== Fileid);
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
        }, (err: HttpErrorResponse) => {
          Swal.fire('Shame on us', 'Unable to delete file', 'error');
          console.log(err);
          console.log(err.name);
          console.log(err.message);
          console.log(err.status);
        });
      }
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadFile() {
    this.account.uploadFile(this.accountId, this.currentAccount['accountType'], this.fileToUpload).subscribe((event: any) => {

      if (event.type === HttpEventType.UploadProgress) {
        this.uploadProgress = Math.round(100 * event.loaded / event.total);
      }

      else if (event instanceof HttpResponse) {
        console.log('File is completely uploaded!');
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
      Swal.fire('Shame on us', 'Unable to upload file', 'error');
      console.log(err);
      console.log(err.name);
      console.log(err.message);
      console.log(err.status);
      this.uploadProgress = 0;
    });
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

}
