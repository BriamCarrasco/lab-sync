import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Forgotpassword } from './forgotpassword';

describe('Forgotpassword', () => {
  let component: Forgotpassword;
  let fixture: ComponentFixture<Forgotpassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Forgotpassword],
    }).compileComponents();

    fixture = TestBed.createComponent(Forgotpassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('email getter should return the form control', () => {
    const control = component.email;
    expect(control).toBeTruthy();
    expect(control?.value).toBe('');
    expect(control?.valid).toBeFalse(); 
  });

  it('showToastMsg should set message, type (default success) and hide after 3000ms', fakeAsync(() => {
    component.showToastMsg('Todo bien');
    expect(component.toastMsg).toBe('Todo bien');
    expect(component.toastType).toBe('success'); 
    expect(component.showToast).toBeTrue();

    tick(3000); 
    expect(component.showToast).toBeFalse();
  }));

  it('showToastMsg should allow explicit "error" type and hide after 3000ms', fakeAsync(() => {
    component.showToastMsg('Algo falló', 'error');
    expect(component.toastMsg).toBe('Algo falló');
    expect(component.toastType).toBe('error');
    expect(component.showToast).toBeTrue();

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('onSubmit should mark submitted & touched and return early when form invalid', () => {
    expect(component.recoveryForm.invalid).toBeTrue();
    expect(component.isSubmitted).toBeFalse();

    component.onSubmit();

    expect(component.isSubmitted).toBeTrue();
    expect(component.email?.touched).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(component.showToast).toBeFalse();
  });

  it('onSubmit should set loading true and then show success after 1500ms + hide toast after 3000ms', fakeAsync(() => {
    component.recoveryForm.controls['email'].setValue('user@example.com');
    expect(component.recoveryForm.valid).toBeTrue();

    component.onSubmit();
    expect(component.isSubmitted).toBeTrue();
    expect(component.loading).toBeTrue();

    tick(1500);
    expect(component.loading).toBeFalse();
    expect(component.showToast).toBeTrue();
    expect(component.toastMsg).toBe('Se ha enviado el enlace de recuperación a tu correo.');
    expect(component.toastType).toBe('success');

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));
});
