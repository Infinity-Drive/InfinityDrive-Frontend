import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse, HttpEventType, HttpResponse } from '@angular/common/http';

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

  @ViewChild('btnClose') btnClose: ElementRef;

  constructor(private account: AccountService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.getFiles();
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

  getSizeInMb(size) {
    if (isNaN(size))
      return '-';
    
    return (Number(size) / Math.pow(1024, 2)).toFixed(2) + ' MB';
  }

  getModifiedTime(isoTime) {
    if (isoTime != '-')
      return new Date(isoTime).toLocaleString();
    return '-'
  }

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

}
