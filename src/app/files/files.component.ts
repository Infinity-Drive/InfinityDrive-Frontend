import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.css']
})
export class FilesComponent implements OnInit {

  files = [{name : 'file0' , type : 'rar'},
    {name : 'file1' , type : 'zip'},
    {name : 'file2' , type : 'png'},
    {name : 'file3' , type : 'exe'},
    {name : 'file4' , type : 'folder'},
    {name : 'file5' , type : 'rar'},
    {name : 'file6' , type : 'rar'},
    {name : 'file7' , type : 'rar'},
    {name : 'file8' , type : 'rar'},
    {name : 'file9' , type : 'rar'}]
  constructor(private account: AccountService, private activeRoute: ActivatedRoute) { }

  ngOnInit() {
    this.activeRoute.params.subscribe( (params) => {
      //this.getfiles(params.id);
    } );
  }

  getfiles(token) {
          this.account.getFiles(token).subscribe((data) => {
            console.log(data);
          });
  }

}
