import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../services/account.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  settings;
  constructor(private accountService: AccountService) { }

  ngOnInit() {
    this.settings = JSON.parse(localStorage.getItem('infinitySettings'));
  }

  saveSettings(){
    console.log(this.settings);
    this.accountService.updateSettings(this.settings).subscribe((data) => {
      localStorage.setItem('infinitySettings', JSON.stringify(this.settings));
      Swal.fire('Success', 'Settings updated!', 'success');
    }, (err: HttpErrorResponse) => {
      const errorMessage = typeof err.error === 'string' ? err.error : 'Unable to update settings';
      Swal.fire('Error', errorMessage, 'error');
      console.log(err);
    })
  }

  changeSetting(item){
    this.settings[`${item.key}`] = item.value;
  }

}
