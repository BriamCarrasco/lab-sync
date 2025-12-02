import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Recoverypassword } from './recoverypassword';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Recoverypassword', () => {
  let component: Recoverypassword;
  let fixture: ComponentFixture<Recoverypassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recoverypassword],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Recoverypassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
