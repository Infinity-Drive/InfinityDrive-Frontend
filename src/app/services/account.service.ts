import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import {Subject} from 'rxjs';

@Injectable()
export class AccountService {

  // private accounts = new BehaviorSubject<any>([]);
  // accountsObservable = this.accounts.asObservable();

  accounts = [];
  baseUrl = 'https://infinitydrive.herokuapp.com';

  private emitAccounSource = new Subject<any[]>();
  accountsToBeEmited = this.emitAccounSource.asObservable();

  constructor(private http: HttpClient) {
  }

  // method for getting drive link for google authentication
  getAuthLink(type) {
    // this will return a promise with google authntication link
    return this.http.get(`${this.baseUrl}/${type}/authorize`);
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
    return this.http.post(`${this.baseUrl}/${type}/saveToken`, { code }, httpOptions);
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
    return this.http.get(`${this.baseUrl}/users/getAccounts`, httpOptions);

  }

  // getting files for a user account
  getFiles(id, type, folderId = undefined) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };

    var url = `${this.baseUrl}/${type}/listFiles/${id}`
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
    return this.http.get(`${this.baseUrl}/merged/listFiles/`, httpOptions);
  }

  getDownloadUrl(accountId, fileId, type) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    return this.http.get(`${this.baseUrl}/${type}/downloadUrl/${accountId}/${fileId}`, httpOptions);
  }

  getDownloadUrlShared(accountId, fileId, type , shareId) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post(`${this.baseUrl}/${type}/downloadUrlShared/${accountId}/${fileId}`, {shareId}, httpOptions);
  }

  deleteAccount(id) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    return this.http.delete(`${this.baseUrl}/users/remove/${id}`, httpOptions);
  }

  deleteFile(accountId, fileId, type) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      }),
      responseType: 'text' as 'text'
    }
    
    const url = type === 'merged' ? `${this.baseUrl}/${type}/delete/${fileId}` : `${this.baseUrl}/${type}/delete/${accountId}/${fileId}`;
    return this.http.delete(url, httpOptions);
  }

  getProperties(accountId, fileId, type) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      }),
    }
    return this.http.get(`${this.baseUrl}/${type}/properties/${accountId}/${fileId}`, httpOptions);
  }

  uploadFile(accountid, type, file, parentId, path) {
    const httpOptions = {
      headers: new HttpHeaders({
        'x-filesize': file.size.toString(),
        'x-auth': localStorage.getItem('infinityToken')
      }),
      responseType: 'text' as 'text',
      reportProgress: true
    };
    const formData: FormData = new FormData();
    formData.append('parentId', parentId);
    formData.append('path', path);
    formData.append('file', file, file.name);
    const req = new HttpRequest('POST', `${this.baseUrl}/${type}/upload/${accountid}`, formData, httpOptions);
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
    const req = new HttpRequest('POST', `${this.baseUrl}/merged/upload`, formData, httpOptions);
    return this.http.request(req);
  }

  downloadStream(fileId, type) {
    return fetch(`${this.baseUrl}/${type}/download/${fileId}`, {
      method: "GET",
      headers:{
        'Content-Type': 'application/octet-stream',
        'x-auth': localStorage.getItem('infinityToken')
      }
    });
  }

  downloadStreamShare(fileId, type , shareId) {
    // console.log(shareId)
    return fetch(`${this.baseUrl}/${type}/downloadShare/${fileId}/${shareId}`, {
      method: "GET",
      headers:{
        'Content-Type': 'application/octet-stream'
      }
    });
  }

  createFolder(accountId, folderName, type, parentFolder, path) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      })
    };
    const body = { folderName, parentFolder, path};
    return this.http.post(`${this.baseUrl}/${type}/createFolder/${accountId}`, body, httpOptions);
  }

  shareFile(clientFileId, accountId, accountType, fileName, fileSize, fileType, userId) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      }),
      responseType: 'text' as 'text'
    };
    const body = { clientFileId, accountId, accountType, fileName, fileSize, fileType, userId};
    return this.http.post(`${this.baseUrl}/share/shareFile`, body, httpOptions);
  }

  logout() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      }),
    };
    return this.http.delete(`${this.baseUrl}/users/logout`, httpOptions);
  }


  getSharedFiles() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-auth': localStorage.getItem('infinityToken')
      }),
    };
    return this.http.get(`${this.baseUrl}/users/sharedFiles`, httpOptions);
  }

  updateAccounts(updatedAccounts){
    this.accounts = updatedAccounts;
    this.emitAccounSource.next(updatedAccounts);
  }
 
}




