import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class AccountService {

  constructor(private http: HttpClient) { }

  getGdriveLink() {
    return this.http.get('http://localhost:3000/gdrive/authorize');
  }
  saveGdriveToken(code) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    return this.http.post('http://localhost:3000/gdrive/saveToken', {code}, httpOptions);
  }

  getAccounts() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
          return this.http.get('http://localhost:3000/user/accounts', httpOptions);
  }

  getFiles(token) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    return this.http.post('http://localhost:3000/gdrive/listFiles', {'token': token}, httpOptions);
  }
  }

