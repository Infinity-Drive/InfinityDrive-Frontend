import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-landin-page',
  templateUrl: './landin-page.component.html',
  styleUrls: ['./landin-page.component.css']
})
export class LandinPageComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {

    if (localStorage.getItem('infinityGuard') === 'yes') {
      this.router.navigateByUrl('Dashboard');
    }

  }

}
