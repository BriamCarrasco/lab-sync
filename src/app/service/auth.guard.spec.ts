import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';
import { AuthService } from './AuthService';
import { Router } from '@angular/router';

describe('authGuard', () => {
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  const loginTree = { url: '/login' } as any;
  const homeTree = { url: '/home' } as any;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj<AuthService>('AuthService', ['isAuthenticated', 'getRole']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should redirect to /login when not authenticated', () => {
    authSpy.isAuthenticated.and.returnValue(false);
    routerSpy.createUrlTree.and.returnValue(loginTree);

    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBe(loginTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
  });

  it('should allow when authenticated and no roles required', () => {
    authSpy.isAuthenticated.and.returnValue(true);
    // No route.data or roles -> should return true
    const result = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('should allow when user role matches required roles after normalization', () => {
    authSpy.isAuthenticated.and.returnValue(true);
    // user role contains ROLE_ and whitespace and different casing
    authSpy.getRole.and.returnValue(' role_admin ');
    spyOn(console, 'debug');

    const route = { data: { roles: ['role_Admin'] } } as any;
    const res = TestBed.runInInjectionContext(() => authGuard(route, {} as any));

    expect(res).toBeTrue();
    expect(console.debug).toHaveBeenCalled();
  });

  it('should redirect to /home when role required but user does not have it', () => {
    authSpy.isAuthenticated.and.returnValue(true);
    authSpy.getRole.and.returnValue('ROLE_USER');
    routerSpy.createUrlTree.and.returnValue(homeTree);
    spyOn(console, 'warn');

    const route = { data: { roles: ['ROLE_ADMIN', 'MANAGER'] } } as any;
    const res = TestBed.runInInjectionContext(() => authGuard(route, {} as any));

    expect(res).toBe(homeTree);
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/home']);
    expect(console.warn).toHaveBeenCalled();
    // optional: ensure warn was called with a payload containing raw role and normalized required roles
    const warnArg = (console.warn as jasmine.Spy).calls.mostRecent().args[1];
    expect(warnArg.usuarioRolRaw).toBe('ROLE_USER');
    expect(Array.isArray(warnArg.requeridos)).toBeTrue();
  });

  it('should allow when required roles array is empty', () => {
    authSpy.isAuthenticated.and.returnValue(true);
    const route = { data: { roles: [] } } as any;
    const res = TestBed.runInInjectionContext(() => authGuard(route, {} as any));
    expect(res).toBeTrue();
  });

  it('should redirect to /home when getRole returns null/undefined', () => {
    authSpy.isAuthenticated.and.returnValue(true);
    authSpy.getRole.and.returnValue(null);
    routerSpy.createUrlTree.and.returnValue(homeTree);
    spyOn(console, 'warn');

    const route = { data: { roles: ['ADMIN'] } } as any;
    const res = TestBed.runInInjectionContext(() => authGuard(route, {} as any));

    expect(res).toBe(homeTree);
    expect(console.warn).toHaveBeenCalled();
  });
});
