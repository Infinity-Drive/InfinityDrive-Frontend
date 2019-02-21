import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MergedAccountComponent } from './merged-account.component';

describe('MergedAccountComponent', () => {
  let component: MergedAccountComponent;
  let fixture: ComponentFixture<MergedAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MergedAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MergedAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
