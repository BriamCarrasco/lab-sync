import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recoverypassword } from './recoverypassword';

describe('Recoverypassword', () => {
  let component: Recoverypassword;
  let fixture: ComponentFixture<Recoverypassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recoverypassword]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recoverypassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
