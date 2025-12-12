import { adminRoleCanMatch } from './admin-role.guard';
import { AuthService } from '../../service/AuthService';
import { Router, UrlTree } from '@angular/router';
import { TestBed } from '@angular/core/testing';

describe('adminRoleCanMatch', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'isAuthenticated',
      'hasRole',
    ]);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should redirect to /login if not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const urlTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => adminRoleCanMatch({} as any, []));
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(urlTree);
  });

  it('should redirect to /home if authenticated but not admin', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.hasRole.and.returnValue(false);
    const urlTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(urlTree);

    const result = TestBed.runInInjectionContext(() => adminRoleCanMatch({} as any, []));
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/home']);
    expect(result).toBe(urlTree);
  });

  it('should allow access if authenticated and has admin role', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.hasRole.and.returnValue(true);

    const result = TestBed.runInInjectionContext(() => adminRoleCanMatch({} as any, []));
    expect(result).toBeTrue();
  });
});
