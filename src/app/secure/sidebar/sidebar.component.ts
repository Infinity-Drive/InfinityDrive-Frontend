import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app/app.state';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  public ngDestroy$ = new Subject();
  accounts;

  constructor(private store: Store<AppState>) { }

  ngOnInit(): void {
    this.store.select('account').pipe(takeUntil(this.ngDestroy$)).subscribe(accounts => {
      this.accounts = accounts
    });
  }

  public ngOnDestroy() {
    this.ngDestroy$.next();
  }

  getParsedEmail(email) {
    const splitEmail = email.split('@');
    return `${splitEmail[0]} (${splitEmail[1].split('.')[0]})`
  }

}
