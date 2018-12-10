import { Injectable } from '@angular/core';
import {CanActivate} from '@angular/router';
import { Router } from '@angular/router';

@Injectable()
export class AuthGuardService  implements CanActivate {

  isLogged;
  constructor(private route: Router) { }

  canActivate() {
    this.update();
    if (this.isLogged === 'yes') {
      return true;
    } else {
        this.route.navigate(['']);
        return false;
    }


  }

  update() {
      this.isLogged = localStorage.getItem('infinityGuard');
  }

}
