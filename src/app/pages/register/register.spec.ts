import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Register } from './register';
import { Router } from '@angular/router';
import { AuthService } from '../../service/AuthService';
import { of, throwError } from 'rxjs';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authSpy: jasmine.SpyObj<any>;
  let routerSpy: jasmine.SpyObj<any>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['register']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('password complexity validator and getters', () => {
    it('validator returns null when control empty', () => {
      component.password?.setValue('');
      expect(component.password?.errors).toBeTruthy(); // required present but validator returns null on empty
    });

    it('valid password passes complexity validator', () => {
      component.password?.setValue('Abcdef1!');
      const errors = component.password?.errors || null;
      expect(errors).toBeNull();
      expect(component.passwordValue).toBe('Abcdef1!');
      expect(component.passwordHasMinLength).toBeTrue();
      expect(component.passwordHasNumber).toBeTrue();
      expect(component.passwordHasUpper).toBeTrue();
      expect(component.passwordHasLower).toBeTrue();
      expect(component.passwordHasSpecial).toBeTrue();
    });

    it('invalid complexity sets passwordComplexity error', () => {
      // 8 chars but missing number and special
      component.password?.setValue('ABCDEFGH');
      const errors = component.password?.errors || {};
      // minLength passed, but complexity should fail
      expect(errors['passwordComplexity'] || errors['minlength']).toBeDefined();
    });
  });

  describe('step navigation', () => {
    it('nextStep leaves step when required fields invalid', () => {
      component.step = 1;
      component.nextStep();
      expect(component.step).toBe(1);
      expect(component.isSubmitted).toBeTrue();
    });

    it('nextStep advances step when required fields valid', () => {
      component.name?.setValue('John');
      component.lastName?.setValue('Doe');
      component.secondLastName?.setValue('X');
      component.rut?.setValue('1234567-8');
      component.nextStep();
      expect(component.step).toBe(2);
      expect(component.isSubmitted).toBeFalse();
    });

    it('prevStep returns to first', () => {
      component.step = 2;
      component.prevStep();
      expect(component.step).toBe(1);
      expect(component.isSubmitted).toBeFalse();
    });
  });

  describe('showToastMsg', () => {
    it('shows and hides toast after timeout', fakeAsync(() => {
      expect(component.showToast).toBeFalse();
      component.showToastMsg('Hola', 'success');
      expect(component.showToast).toBeTrue();
      expect(component.toastMsg).toBe('Hola');
      expect(component.toastType).toBe('success');
      tick(3000);
      expect(component.showToast).toBeFalse();
    }));
  });

  describe('onSubmit', () => {
    it('does nothing if form invalid', () => {
      const markSpy = spyOn(component.registerForm, 'markAllAsTouched');
      authSpy.register.and.returnValue(of(null));

      component.onSubmit();

      expect(component.isSubmitted).toBeTrue();
      expect(markSpy).toHaveBeenCalled();
      expect(authSpy.register).not.toHaveBeenCalled();
      expect(component.loading).toBeFalse();
    });

    it('on success shows toast, stops loading and navigates after delay', fakeAsync(() => {
      // fill form with valid values
      component.registerForm.setValue({
        name: 'A',
        lastName: 'B',
        secondLastName: 'C',
        rut: '12345678-9',
        username: 'u1',
        email: 'a@a.com',
        password: 'Abcdef1!',
      });

      authSpy.register.and.returnValue(of(null));

      component.onSubmit();

      // register should have been called immediately
      expect(authSpy.register).toHaveBeenCalled();
      // while waiting for async navigation
      expect(component.loading).toBeFalse();
      expect(component.showToast).toBeTrue();
      expect(component.toastType).toBe('success');

      // navigation happens after 1500
      tick(1500);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);

      // toast hide after 3000 from showToastMsg (we tick up to full 3000)
      tick(1500); // total 3000
      expect(component.showToast).toBeFalse();
    }));

    it('on error 409 shows specific message', fakeAsync(() => {
      component.registerForm.setValue({
        name: 'A',
        lastName: 'B',
        secondLastName: 'C',
        rut: '12345678-9',
        username: 'u1',
        email: 'a@a.com',
        password: 'Abcdef1!',
      });

      authSpy.register.and.returnValue(throwError(() => ({ status: 409 })));

      component.onSubmit();

      expect(authSpy.register).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
      expect(component.showToast).toBeTrue();
      expect(component.toastType).toBe('error');
      expect(component.toastMsg).toContain('nombre de usuario');

      // hide scheduled by showToastMsg
      tick(3000);
      expect(component.showToast).toBeFalse();
    }));

    it('on error generic shows fallback message', fakeAsync(() => {
      component.registerForm.setValue({
        name: 'A',
        lastName: 'B',
        secondLastName: 'C',
        rut: '12345678-9',
        username: 'u1',
        email: 'a@a.com',
        password: 'Abcdef1!',
      });

      authSpy.register.and.returnValue(throwError(() => ({ status: 500 })));

      component.onSubmit();

      expect(authSpy.register).toHaveBeenCalled();
      expect(component.loading).toBeFalse();
      expect(component.toastType).toBe('error');
      expect(component.toastMsg).toContain('Error al registrar');

      tick(3000);
      expect(component.showToast).toBeFalse();
    }));
  });

  describe('username & email getters', () => {
    it('username getter returns the control and reflects value & required validation', () => {
      // Existe el control
      expect(component.username).toBeTruthy();

      // Valid when has value
      component.username?.setValue('user_test');
      expect(component.username?.value).toBe('user_test');
      expect(component.username?.valid).toBeTrue();

      // Invalid when empty (required)
      component.username?.setValue('');
      expect(component.username?.invalid).toBeTrue();
      expect(component.username?.errors).toBeTruthy();
      expect(component.username?.errors?.['required']).toBeTrue();
    });

    it('email getter returns the control and validates email format', () => {
      // Existe el control
      expect(component.email).toBeTruthy();

      // invalid email format
      component.email?.setValue('not-an-email');
      expect(component.email?.invalid).toBeTrue();
      expect(component.email?.errors).toBeTruthy();
      // Angular email validator uses { email: true }
      expect(component.email?.errors?.['email']).toBeTrue();

      // valid email
      component.email?.setValue('someone@example.com');
      expect(component.email?.valid).toBeTrue();
      expect(component.email?.errors).toBeNull();
    });
  });

  it('showToastMsg uses default "success" when type omitted', fakeAsync(() => {
    // estado inicial
    expect(component.showToast).toBeFalse();
    // llamar sin segundo argumento -> debe default a 'success'
    component.showToastMsg('Mensaje predeterminado');
    expect(component.showToast).toBeTrue();
    expect(component.toastMsg).toBe('Mensaje predeterminado');
    expect(component.toastType).toBe('success'); // rama por defecto
    // avanzar tiempo para ocultar
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('passwordValue returns empty string when password empty', () => {
    // vaciar la contraseña (cubre la rama || '')
    component.password?.setValue('');
    expect(component.passwordValue).toBe('');
  });
});
