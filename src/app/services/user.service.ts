import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }

  // authenticating user
  authnticateUser(email, pass) {
      // returning server result to the component
      return this.http.post('http://localhost:3000/users/login', {'email': email, 'password': pass} , {observe: 'response'});
  }

  // creating new user
  registerUser(email, pass, name) {
    // returning server result to the component
    return this.http.post('http://localhost:3000/users', {'email': email, 'password': pass, 'name': name } , { observe: 'response'});
  }
}



