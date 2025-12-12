import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Login } from './login';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from '../../service/AuthService';
import { of, throwError } from 'rxjs';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);

    // valor por defecto respetando la interfaz AuthResponse
    authSpy.login.and.returnValue(of({ token: '', username: '', role: '' }));

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [{ provide: AuthService, useValue: authSpy }, provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('username and password getters should return controls', () => {
    const username = component.username;
    const password = component.password;
    expect(username).toBeTruthy();
    expect(password).toBeTruthy();
    expect(username?.value).toBe('');
    expect(password?.value).toBe('');
    expect(username?.valid).toBeFalse();
    expect(password?.valid).toBeFalse();
  });

  it('showToastMsg sets values and hides after 3000ms (default success)', fakeAsync(() => {
    component.showToastMsg('OK!');
    expect(component.toastMsg).toBe('OK!');
    expect(component.toastType).toBe('success');
    expect(component.showToast).toBeTrue();

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('showToastMsg supports explicit error type and hides after 3000ms', fakeAsync(() => {
    component.showToastMsg('Bad', 'error');
    expect(component.toastMsg).toBe('Bad');
    expect(component.toastType).toBe('error');
    expect(component.showToast).toBeTrue();

    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('onSubmit returns early when form is invalid and marks touched', () => {
    expect(component.loginForm.invalid).toBeTrue();
    expect(component.isSubmitted).toBeFalse();

    authSpy.login.calls.reset();

    component.onSubmit();

    expect(component.isSubmitted).toBeTrue();
    expect(component.username?.touched).toBeTrue();
    expect(component.password?.touched).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  it('onSubmit success -> role ADMIN navigates to /admin and displays success toast', fakeAsync(() => {
    component.loginForm.controls['username'].setValue('u');
    component.loginForm.controls['password'].setValue('p');

    authSpy.login.and.returnValue(
      of({
        token: 't1',
        username: 'admin',
        role: 'ADMIN',
        id: 1,
      })
    );

    component.onSubmit();

    expect(component.isSubmitted).toBeTrue();
    expect(component.loading).toBeFalse();
    expect(component.toastMsg).toBe('Inicio de sesión exitoso');
    expect(component.toastType).toBe('success');
    expect(component.showToast).toBeTrue();

    expect(router.navigate).not.toHaveBeenCalled();
    tick(1000);
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);

    tick(2000);
    expect(component.showToast).toBeFalse();
  }));

  it('onSubmit success -> role ROLE_ADMIN navigates to /admin (prefix removed)', fakeAsync(() => {
    component.loginForm.controls['username'].setValue('u2');
    component.loginForm.controls['password'].setValue('p2');

    authSpy.login.and.returnValue(
      of({
        token: 't2',
        username: 'admin2',
        role: 'ROLE_admin',
        id: 2,
      })
    );

    component.onSubmit();

    tick(1000);
    expect(router.navigate).toHaveBeenCalledWith(['/admin']);
  }));

  it('onSubmit success non-admin navigates to /home', fakeAsync(() => {
    component.loginForm.controls['username'].setValue('user');
    component.loginForm.controls['password'].setValue('pass');

    authSpy.login.and.returnValue(
      of({
        token: 't3',
        username: 'user',
        role: 'ROLE_USER',
        id: 3,
      })
    );

    component.onSubmit();

    tick(1000);
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('onSubmit error 401 shows "Credenciales inválidas." toast', fakeAsync(() => {
    component.loginForm.controls['username'].setValue('x');
    component.loginForm.controls['password'].setValue('y');

    authSpy.login.and.returnValue(throwError(() => ({ status: 401 })));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(component.toastMsg).toBe('Credenciales inválidas.');
    expect(component.toastType).toBe('error');
    expect(component.showToast).toBeTrue();

    tick(3000);
    expect(component.showToast).toBeFalse();

    expect(router.navigate).not.toHaveBeenCalled();
  }));

  it('onSubmit error other status shows generic error toast', fakeAsync(() => {
    component.loginForm.controls['username'].setValue('x2');
    component.loginForm.controls['password'].setValue('y2');

    authSpy.login.and.returnValue(throwError(() => ({ status: 500 })));

    component.onSubmit();

    expect(component.loading).toBeFalse();
    expect(component.toastMsg).toBe('Error al iniciar sesión. Intenta nuevamente.');
    expect(component.toastType).toBe('error');
    expect(component.showToast).toBeTrue();

    tick(3000);
    expect(component.showToast).toBeFalse();
    expect(router.navigate).not.toHaveBeenCalled();
  }));
});
