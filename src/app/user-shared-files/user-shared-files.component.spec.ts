import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSharedFilesComponent } from './user-shared-files.component';

describe('UserSharedFilesComponent', () => {
  let component: UserSharedFilesComponent;
  let fixture: ComponentFixture<UserSharedFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserSharedFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserSharedFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
