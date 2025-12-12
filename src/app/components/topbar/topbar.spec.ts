import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Topbar } from './topbar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../../service/AuthService';

describe('Topbar', () => {
  let component: Topbar;
  let fixture: ComponentFixture<Topbar>;
  let authMock: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authMock = jasmine.createSpyObj<AuthService>('AuthService', [
      'isAuthenticated',
      'getUsername',
      'getRole',
      'logout',
    ]);

    authMock.isAuthenticated.and.returnValue(false);
    authMock.getUsername.and.returnValue(null);
    authMock.getRole.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [Topbar, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authMock }],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(Topbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call auth.isAuthenticated and return true/false', () => {
    authMock.isAuthenticated.and.returnValue(true);
    expect(component.isAuthenticated()).toBeTrue();
    expect(authMock.isAuthenticated).toHaveBeenCalled();

    authMock.isAuthenticated.and.returnValue(false);
    expect(component.isAuthenticated()).toBeFalse();
  });

  it('should return username from auth and call the underlying spy', () => {
    authMock.getUsername.and.returnValue('usuario');
    expect(component.username).toBe('usuario');
    expect(authMock.getUsername).toHaveBeenCalled();
  });

  it('should return role from auth and call the underlying spy', () => {
    authMock.getRole.and.returnValue('ADMIN');
    expect(component.role).toBe('ADMIN');
    expect(authMock.getRole).toHaveBeenCalled();
  });

  it('should return true for isAdmin() with "ADMIN"', () => {
    authMock.getRole.and.returnValue('ADMIN');
    expect(component.isAdmin()).toBeTrue();
  });

  it('should return true for isAdmin() with "ROLE_ADMIN"', () => {
    authMock.getRole.and.returnValue('ROLE_ADMIN');
    expect(component.isAdmin()).toBeTrue();
  });

  it('should return true for isAdmin() with whitespace and different case (" admin ")', () => {
    authMock.getRole.and.returnValue(' admin ');
    expect(component.isAdmin()).toBeTrue(); 
  });

  it('should return false for isAdmin() with "USER"', () => {
    authMock.getRole.and.returnValue('USER');
    expect(component.isAdmin()).toBeFalse();
  });

  it('should return false for isAdmin() with null', () => {
    authMock.getRole.and.returnValue(null);
    expect(component.isAdmin()).toBeFalse();
  });

  it('should call auth.logout and router.navigate on logout()', () => {
    component.logout();
    expect(authMock.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/landing']);
  });
});
