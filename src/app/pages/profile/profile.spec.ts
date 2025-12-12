import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Profile } from './profile';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UserService } from '../../service/UserService';
import { AuthService } from '../../service/AuthService';
import { of, throwError } from 'rxjs';
import { User } from '../../model/User';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockUser: User = {
    id: 1,
    name: 'Juan',
    firstLastname: 'Pérez',
    secondLastname: 'Gómez',
    username: 'juanp',
    rut: '12345678-9',
    email: 'juan@example.com',
    role: 'USER',
  };

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj<UserService>('UserService', [
      'getById',
      'getByUsername',
      'update',
    ]);
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'getUserId',
      'getUsername',
      'getToken',
    ]);
    // Valores por defecto
    userServiceSpy.getById.and.returnValue(of(mockUser));
    userServiceSpy.getByUsername.and.returnValue(of(mockUser));
    userServiceSpy.update.and.returnValue(of({ ...mockUser, name: 'Juanito' }));
    authServiceSpy.getUserId.and.returnValue(mockUser.id);
    authServiceSpy.getUsername.and.returnValue(mockUser.username);
    authServiceSpy.getToken.and.returnValue('token.jwt');

    await TestBed.configureTestingModule({
      imports: [Profile],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and load user by id', fakeAsync(() => {
    spyOn<any>(component, 'loadCurrentUser').and.callThrough();
    component.ngOnInit();
    tick();
    expect(component.user).toEqual(mockUser);
    expect(component.profileForm.value.name).toBe(mockUser.name);
    expect(component.profileForm.value.lastName).toBe(mockUser.firstLastname);
    expect(component.profileForm.value.secondLastName).toBe(mockUser.secondLastname);
    expect(component.profileForm.value.userName).toBe(mockUser.username);
    expect(component.profileForm.getRawValue().rut).toBe(mockUser.rut);
    expect(component.profileForm.getRawValue().email).toBe(mockUser.email);
  }));

  it('should load user by username if id is missing', fakeAsync(() => {
    authServiceSpy.getUserId.and.returnValue(null);
    userServiceSpy.getByUsername.and.returnValue(
      throwError(() => new Error('Usuario no encontrado'))
    );
    component['loadCurrentUser']();
    tick();
    expect(userServiceSpy.getByUsername).toHaveBeenCalledWith(mockUser.username);
    expect(component.user).toEqual(mockUser);
  }));

  it('should extract username from token if username is missing', fakeAsync(() => {
    authServiceSpy.getUserId.and.returnValue(null);
    authServiceSpy.getUsername.and.returnValue(null);
    // token con payload {sub: "juanp"}
    const token = [btoa('header'), btoa(JSON.stringify({ sub: 'juanp' })), btoa('sig')].join('.');
    authServiceSpy.getToken.and.returnValue(token);
    userServiceSpy.getByUsername.and.returnValue(of(mockUser));
    component['loadCurrentUser']();
    tick();
    expect(component.user).toEqual(mockUser);
  }));

  it('should show error if username cannot be extracted', fakeAsync(() => {
    authServiceSpy.getUserId.and.returnValue(null);
    authServiceSpy.getUsername.and.returnValue(null);
    authServiceSpy.getToken.and.returnValue(null);
    const showErrorSpy = spyOn(component, 'showError');
    component['loadCurrentUser']();
    tick();
    expect(showErrorSpy).toHaveBeenCalledWith('No se pudo identificar el usuario');
  }));

  it('should show error if user not found by username', fakeAsync(() => {
    authServiceSpy.getUserId.and.returnValue(null);
    userServiceSpy.getByUsername.and.returnValue(of(undefined));
    const showErrorSpy = spyOn(component, 'showError');
    component['loadCurrentUser']();
    tick();
    expect(showErrorSpy).toHaveBeenCalledWith('Usuario no encontrado');
  }));

  it('should show error on loadCurrentUser catch', fakeAsync(() => {
    userServiceSpy.getById.and.returnValue(throwError(() => ({})));
    const showErrorSpy = spyOn(component, 'showError');
    component['loadCurrentUser']();
    tick();
    expect(showErrorSpy).toHaveBeenCalledWith('Error al cargar usuario');
  }));

  it('should get all form controls via getters', () => {
    expect(component.name).toBeTruthy();
    expect(component.lastName).toBeTruthy();
    expect(component.secondLastName).toBeTruthy();
    expect(component.userName).toBeTruthy();
    expect(component.rut).toBeTruthy();
    expect(component.email).toBeTruthy();
  });

  it('should not submit if form is invalid or user is null', fakeAsync(() => {
    component.profileForm.controls['name'].setValue('');
    component.user = null;
    component.onSubmit();
    expect(component.isSubmitted).toBeTrue();
    expect(component.loading).toBeFalse();
  }));

  it('should update user and show success on submit', fakeAsync(() => {
    component.user = mockUser;
    component.profileForm.controls['name'].setValue('Juanito');
    component.profileForm.controls['lastName'].setValue('Pérez');
    component.profileForm.controls['secondLastName'].setValue('Gómez');
    component.profileForm.controls['userName'].setValue('juanp');
    component.onSubmit();
    tick();
    expect(component.user?.name).toBe('Juanito');
    expect(component.toastMsg).toBe('Perfil actualizado correctamente');
    expect(component.toastType).toBe('success');
    expect(component.showToast).toBeTrue();
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('should show error on update fail', fakeAsync(() => {
    component.user = mockUser;
    userServiceSpy.update.and.returnValue(throwError(() => ({ error: 'Error personalizado' })));
    component.profileForm.controls['name'].setValue('Juanito');
    component.profileForm.controls['lastName'].setValue('Pérez');
    component.profileForm.controls['secondLastName'].setValue('Gómez');
    component.profileForm.controls['userName'].setValue('juanp');
    component.onSubmit();
    tick();
    expect(component.toastMsg).toBe('Error personalizado');
    expect(component.toastType).toBe('error');
    expect(component.showToast).toBeTrue();
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('should show generic error on update fail with no error string', fakeAsync(() => {
    component.user = mockUser;
    userServiceSpy.update.and.returnValue(throwError(() => ({})));
    component.profileForm.controls['name'].setValue('Juanito');
    component.profileForm.controls['lastName'].setValue('Pérez');
    component.profileForm.controls['secondLastName'].setValue('Gómez');
    component.profileForm.controls['userName'].setValue('juanp');
    component.onSubmit();
    tick();
    expect(component.toastMsg).toBe('Error al actualizar perfil');
    expect(component.toastType).toBe('error');
    expect(component.showToast).toBeTrue();
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('showSuccess should set toast values and hide after 3000ms', fakeAsync(() => {
    component.showSuccess('¡Éxito!');
    expect(component.toastMsg).toBe('¡Éxito!');
    expect(component.toastType).toBe('success');
    expect(component.showToast).toBeTrue();
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('showError should set toast values and hide after 3000ms', fakeAsync(() => {
    component.showError('¡Error!');
    expect(component.toastMsg).toBe('¡Error!');
    expect(component.toastType).toBe('error');
    expect(component.showToast).toBeTrue();
    tick(3000);
    expect(component.showToast).toBeFalse();
  }));

  it('getUsernameFromToken should extract username from valid token', () => {
    const token = [btoa('header'), btoa(JSON.stringify({ sub: 'juanp' })), btoa('sig')].join('.');
    expect(component['getUsernameFromToken'](token)).toBe('juanp');
  });

  it('getUsernameFromToken should return null for invalid token', () => {
    expect(component['getUsernameFromToken'](null)).toBeNull();
    expect(component['getUsernameFromToken']('invalid.token')).toBeNull();
    const token = [btoa('header'), btoa(JSON.stringify({})), btoa('sig')].join('.');
    expect(component['getUsernameFromToken'](token)).toBeNull();
  });

  it('getUsernameFromToken should return null if payload is null', () => {
    // Crea un token con payload "null"
    const token = [btoa('header'), btoa('null'), btoa('sig')].join('.');
    expect(component['getUsernameFromToken'](token)).toBeNull();
  });

  it('getUsernameFromToken should return null if payload is undefined', () => {
    // Crea un token con payload "undefined"
    const token = [btoa('header'), btoa('undefined'), btoa('sig')].join('.');
    expect(component['getUsernameFromToken'](token)).toBeNull();
  });

  it('should set role as empty string if user.role is null', fakeAsync(() => {
    // Crea un usuario con role null (usando cast para evitar error de tipo)
    const userWithoutRole = { ...mockUser, role: null } as any;
    component.user = userWithoutRole;
    component.profileForm.controls['name'].setValue('Juanito');
    component.profileForm.controls['lastName'].setValue('Pérez');
    component.profileForm.controls['secondLastName'].setValue('Gómez');
    component.profileForm.controls['userName'].setValue('juanp');

    // Espía el método update para capturar el payload
    let capturedPayload: any;
    userServiceSpy.update.and.callFake((id, payload) => {
      capturedPayload = payload;
      return of({ ...userWithoutRole, name: 'Juanito' });
    });

    component.onSubmit();
    tick();

    expect(capturedPayload.role).toBe('');
  }));
});
