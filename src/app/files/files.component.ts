import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {

  files;
  accountId;
  constructor(private account: AccountService, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activeRoute.params.subscribe( (params) => {
      this.accountId = params.id;
      this.getfiles(params.id);
    } );
  }

  getfiles(id) {
          this.account.getFiles(id).subscribe((data) => {
            console.log(data)
            this.files = data ;
          });
  }

  getDownloadLink(Fileid) {
    this.account.getDownloadUrl(this.accountId, Fileid).subscribe((url: string) => {
      window.open(url['downloadUrl'], '_blank');
    });
  }
}
