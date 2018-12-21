import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Tiny2Component } from './tiny2.component';

describe('Tiny2Component', () => {
  let component: Tiny2Component;
  let fixture: ComponentFixture<Tiny2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Tiny2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Tiny2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
