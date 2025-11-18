import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Registry } from './registry';

describe('Registry', () => {
  let component: Registry;
  let fixture: ComponentFixture<Registry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registry]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Registry);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
