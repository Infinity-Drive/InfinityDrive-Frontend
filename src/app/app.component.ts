import { Component, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { EmitterService } from './services/emitter.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('snav') sideNav;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private emitterService: EmitterService
  ) { }

  ngOnInit(): void {
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case 'toggleSidebar':
          return this.sideNav.toggle();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
