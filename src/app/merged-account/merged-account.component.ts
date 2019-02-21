import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-merged-account',
  templateUrl: './merged-account.component.html',
  styleUrls: ['./merged-account.component.css']
})
export class MergedAccountComponent implements OnInit {

  files:any = []; 
  loading = false;

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

  constructor(private account: AccountService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.getFiles();
  }

  getFiles(){
    this.loading = true;
    this.account.getMergedAccountFiles().subscribe((mergedAccountFiles:any) => {
      mergedAccountFiles.forEach(mergedAccount => {
        // console.log(mergedAccount.files, mergedAccount.accountType);
        this.files.push(...this.standarizeFileData(mergedAccount.files, mergedAccount.accountType, mergedAccount['_id']));
      });
      console.log('merged files', this.files);
      this.loading = false;
    });
    
  }

  deleteFile(file) {
    this.account.deleteFile(file.accountId, file.id, file.accountType).subscribe((data) => {
      this.files = this.files.filter((f) => f.id != file.id);
    });
  }

  getFolderItems(folder) {
    // this.loading = true;
    this.account.getFiles(folder.accountId, folder.accountType, folder.id).subscribe((data) => {
      console.log(data);
      this.files = this.standarizeFileData(data, folder.accountType, folder.accountId);
      // console.log(this.files);
    });
  }

  getSizeInMb(size) {
    if (isNaN(size))
      return '-';
    else
      return (Number(size) / Math.pow(1024, 2)).toFixed(2) + ' MB';
  }

}
