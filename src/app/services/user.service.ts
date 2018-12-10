import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }


  authnticateUser(email, pass) {
      return this.http.post('http://localhost:3000/users/login', {'email': email, 'password': pass} , {observe: 'response'});
  }

  registerUser(email, pass, name) {
    return this.http.post('http://localhost:3000/users', {'email': email, 'password': pass, 'name': name } , { observe: 'response'});
  }
}



