import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Recoverypassword } from './recoverypassword';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from '../../service/UserService';
import { AuthService } from '../../service/AuthService';
import { of, throwError } from 'rxjs';

describe('Recoverypassword', () => {
  let component: Recoverypassword;
  let fixture: ComponentFixture<Recoverypassword>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', ['changePassword']);
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['getUserId']);
    userServiceSpy.changePassword.and.returnValue(of(void 0));
    authServiceSpy.getUserId.and.returnValue(1);

    await TestBed.configureTestingModule({
      imports: [Recoverypassword],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Recoverypassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate password complexity', () => {
    component.newPassword.setValue('abc');
    expect(component.newPassword.errors?.['minlength']).toBeTruthy();
    component.newPassword.setValue('abcdefgh');
    expect(component.newPassword.errors?.['passwordComplexity']).toBeTruthy();
    component.newPassword.setValue('Abcdefg1!');
    expect(component.newPassword.errors).toBeNull();
  });

  it('should detect password mismatch', () => {
    component.newPassword.setValue('Abcdefg1!');
    component.repeatPassword.setValue('Abcdefg1?');
    component.passwordForm.updateValueAndValidity();
    expect(component.passwordForm.errors?.['mismatch']).toBeTrue();
    component.repeatPassword.setValue('Abcdefg1!');
    component.passwordForm.updateValueAndValidity();
    expect(component.passwordForm.errors).toBeNull();
  });

  it('should show error if form is invalid (mismatch)', fakeAsync(() => {
    spyOn(component, 'showError');
    component.newPassword.setValue('Abcdefg1!');
    component.repeatPassword.setValue('Abcdefg1?');
    component.currentPassword.setValue('oldpass');
    component.onSubmit();
    expect(component.showError).toHaveBeenCalledWith('Las contraseñas nuevas no coinciden.');
  }));

  it('should show error if form is invalid (complexity)', fakeAsync(() => {
    spyOn(component, 'showError');
    component.newPassword.setValue('abcdefgh');
    component.repeatPassword.setValue('abcdefgh');
    component.currentPassword.setValue('oldpass');
    component.onSubmit();
    expect(component.showError).toHaveBeenCalledWith(
      'La contraseña debe tener al menos 8 caracteres, contener una mayúscula, una minúscula, un número y un símbolo especial.'
    );
  }));

  it('should show error if user id is missing', () => {
    spyOn(component, 'showError');
    authServiceSpy.getUserId.and.returnValue(null);
    component.newPassword.setValue('Abcdefg1!');
    component.repeatPassword.setValue('Abcdefg1!');
    component.currentPassword.setValue('oldpass');
    component.onSubmit();
    expect(component.showError).toHaveBeenCalledWith('No se pudo identificar el usuario.');
  });

  it('should call changePassword and show success', fakeAsync(() => {
    spyOn(component, 'showSuccess');
    component.newPassword.setValue('Abcdefg1!');
    component.repeatPassword.setValue('Abcdefg1!');
    component.currentPassword.setValue('oldpass');
    component.onSubmit();
    expect(userServiceSpy.changePassword).toHaveBeenCalledWith(1, 'oldpass', 'Abcdefg1!');
    tick();
    expect(component.showSuccess).toHaveBeenCalledWith('Contraseña actualizada correctamente.');
    expect(component.loading).toBeFalse();
  }));

  it('should show error if changePassword returns 400', fakeAsync(() => {
    spyOn(component, 'showError');
    userServiceSpy.changePassword.and.returnValue(throwError(() => ({ status: 400 })));
    component.newPassword.setValue('Abcdefg1!');
    component.repeatPassword.setValue('Abcdefg1!');
    component.currentPassword.setValue('oldpass');
    component.onSubmit();
    tick();
    expect(component.showError).toHaveBeenCalledWith('La contraseña actual es incorrecta.');
    expect(component.loading).toBeFalse();
  }));

  it('should show error if changePassword returns other error', fakeAsync(() => {
    spyOn(component, 'showError');
    userServiceSpy.changePassword.and.returnValue(throwError(() => ({ status: 500 })));
    component.newPassword.setValue('Abcdefg1!');
    component.repeatPassword.setValue('Abcdefg1!');
    component.currentPassword.setValue('oldpass');
    component.onSubmit();
    tick();
    expect(component.showError).toHaveBeenCalledWith('No se pudo actualizar la contraseña.');
    expect(component.loading).toBeFalse();
  }));

  it('showSuccess should set toast and hide after 3000ms', fakeAsync(() => {
    component.showSuccess('ok');
    expect(component.toastMsg).toBe('ok');
    expect(component.toastType).toBe('success');
    expect(component.showToast).toBeTrue();
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('showError should set toast and hide after 3000ms', fakeAsync(() => {
    component.showError('fail');
    expect(component.toastMsg).toBe('fail');
    expect(component.toastType).toBe('error');
    expect(component.showToast).toBeTrue();
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('should validate newPasswordValue and helpers', () => {
    component.newPassword.setValue('Abc1!');
    expect(component.newPasswordValue).toBe('Abc1!');
    expect(component.newPasswordHasMinLength).toBeFalse();
    component.newPassword.setValue('Abcdefg1!');
    expect(component.newPasswordHasMinLength).toBeTrue();
    expect(component.newPasswordHasNumber).toBeTrue();
    expect(component.newPasswordHasUpper).toBeTrue();
    expect(component.newPasswordHasLower).toBeTrue();
    expect(component.newPasswordHasSpecial).toBeTrue();
  });
});
