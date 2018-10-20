import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-accounts',
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {

  accounts = [{name : 'One Drive' , account : 'abbasnazar.970@gmail.com'},
    {name : 'Out Look' , account : 'abbasnazar.970@outlook.com'},
    {name : 'Drop Box' , account : 'abbasnazar.970@gmail.com'}]
  constructor() { }

  ngOnInit() {
  }

}
