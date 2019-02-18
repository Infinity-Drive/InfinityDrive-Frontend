import {Component, OnInit} from '@angular/core';
import {AccountService} from '../services/account.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {

  files;
  accountId;
  // user accounts array
  accounts = [];
  fileToUpload: File = null;

  constructor(private account: AccountService, private activeRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activeRoute.params.subscribe((params) => {
      this.accountId = params.id;
      this.account.accountsObservable.subscribe(data => this.accounts = data);
      this.getfiles(params.id);
    });
  }

  getfiles(id) {
         const currentAccount = this.accounts.find(account => account['_id'] === id);
      this.account.getFiles(id, currentAccount['accountType']).subscribe((data) => {
        // console.log(data)
        this.files = data;
        // console.log(this.files);
      });
  }

  getDownloadLink(Fileid) {
    const currentAccount = this.accounts.find(account => account['_id'] === this.accountId);
    this.account.getDownloadUrl(this.accountId, Fileid, currentAccount['accountType']).subscribe((url: string) => {
      window.open(url['downloadUrl'], '_blank');
    });
  }

  deleteFile(Fileid) {
    const currentAccount = this.accounts.find(account => account['_id'] === this.accountId);
    this.account.deleteFile(this.accountId, Fileid, currentAccount['accountType']).subscribe((data) => {
          this.getfiles(this.accountId);
    });
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
  }

  uploadFile() {
    const currentAccount = this.accounts.find(account => account['_id'] === this.accountId);
    this.account.uploadFile(this.accountId, currentAccount['accountType'], this.fileToUpload).subscribe((url: string) => {
      console.log('file Uploaded');
    });
  }
}
