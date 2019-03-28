import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

@Injectable()
export class AccountService {

  // private accounts = new BehaviorSubject<any>([]);
  // accountsObservable = this.accounts.asObservable();

  accounts = [];

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
    return this.http.post(`http://localhost:3000/${type}/saveToken`, { code }, httpOptions);
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
    return this.http.get('http://localhost:3000/users/getAccounts', httpOptions);

  }

  // getting files for a user account
  getFiles(id, type, folderId = undefined) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };

    var url = `http://localhost:3000/${type}/listFiles/${id}`
    folderId ? url += `/${folderId}` : url ;
    return this.http.get(url, httpOptions);
  }

  getMergedAccountFiles() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    return this.http.get('http://localhost:3000/merged/listFiles/', httpOptions);
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

  uploadFile(accountid, type, file) {
    const httpOptions = {
      headers: new HttpHeaders({
        'x-filesize': file.size.toString(),
        'x-auth': localStorage.getItem('infinityToken')
      }),
      responseType: 'text' as 'text',
      reportProgress: true
    };
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const req = new HttpRequest('POST', `http://localhost:3000/${type}/upload/${accountid}`, formData, httpOptions);
    return this.http.request(req);
  }

  splitUpload(file) {
    const httpOptions = {
      headers: new HttpHeaders({
        'x-filesize': file.size.toString(),
        'x-auth': localStorage.getItem('infinityToken')
      }),
      reportProgress: true
    };
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    const req = new HttpRequest('POST', 'http://localhost:3000/merged/upload', formData, httpOptions);
    return this.http.request(req);
  }

  downloadStream(fileId, type) {
    return fetch(`http://localhost:3000/${type}/download/${fileId}`, {
      method: "GET",
      headers:{
        'Content-Type': 'application/octet-stream',
        'x-auth': localStorage.getItem('infinityToken')
      }
    });
  }
}




