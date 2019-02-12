import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AccountService {

  constructor(private http: HttpClient) { }

  // method for getting drive link for google authentication
  getGdriveLink() {
    // this will return a promise with google authntication link
    return this.http.get('http://localhost:3000/gdrive/authorize');
  }
  saveGdriveToken(code) {
    // setting header for the request
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    // sending token code to server
    return this.http.post('http://localhost:3000/gdrive/saveToken', {code}, httpOptions);
  }

  // getting user accounts
  getAccounts() {
    // setting header for the request
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    // returning promise with user account array
    return this.http.get('http://localhost:3000/users/getAccounts', httpOptions);
  }
  // getting files for a user account
  getFiles(id) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    return this.http.get(`http://localhost:3000/gdrive/listFiles/${id}`, httpOptions);
  }

  getDownloadUrl(accountId, fileId) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    return this.http.get(`http://localhost:3000/gdrive/downloadUrl/${accountId}/${fileId}`, httpOptions);
  }
  }

