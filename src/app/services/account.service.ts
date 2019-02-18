import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class AccountService {

  private accounts = new BehaviorSubject<any>([]);
  accountsObservable = this.accounts.asObservable();

  constructor(private http: HttpClient) {
  }

  // method for getting drive link for google authentication
  getAuthLink(type) {
    // this will return a promise with google authntication link
    return this.http.get(`http://localhost:3000/${type}/authorize`);
  }


  saveToken(code, type) {
    // setting header for the request
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    // sending token code to server
    return this.http.post(`http://localhost:3000/${type}/saveToken`, {code}, httpOptions);
  }

  // getting user accounts
  getAccounts() {
    // setting header for the request
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    // returning promise with user account array
    this.http.get('http://localhost:3000/users/getAccounts', httpOptions).subscribe((data: any) => {
      console.log(data);
      this.accounts.next(data);
    }, (err: any) => {
      this.accounts.next([]);
    });

  }

  // getting files for a user account
  getFiles(id, type) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    return this.http.get(`http://localhost:3000/${type}/listFiles/${id}`, httpOptions);
  }

  getDownloadUrl(accountId, fileId, type) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    return this.http.get(`http://localhost:3000/${type}/downloadUrl/${accountId}/${fileId}`, httpOptions);
  }

  deleteAccount(id) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    return this.http.delete(`http://localhost:3000/users/remove/${id}`, httpOptions);
  }

  deleteFile(accountId, fileId, type) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      }),
      responseType: 'text' as 'text'
    }
    return this.http.delete(`http://localhost:3000/${type}/delete/${accountId}/${fileId}`, httpOptions);
  }

  changeMergeStatus(accountIds, status) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      }),
      responseType: 'text' as 'text'
    }
    return this.http.patch(`http://localhost:3000/users/manage/accounts/merge`, { accountIds, status }, httpOptions);
  }
}




