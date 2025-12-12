import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import {
  AuthService,
  AuthResponse,
  RegisteredUser,
  LoginRequest,
  RegisterRequest,
} from './AuthService';

describe('AuthService', () => {
  let service: AuthService;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let setItemSpy: jasmine.Spy;
  let getItemSpy: jasmine.Spy;
  let removeItemSpy: jasmine.Spy;

  const baseUrl = 'http://localhost:8081/auth';

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['post']);
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpSpy }, AuthService],
    });
    service = TestBed.inject(AuthService);

    setItemSpy = spyOn(localStorage, 'setItem');
    getItemSpy = spyOn(localStorage, 'getItem');
    removeItemSpy = spyOn(localStorage, 'removeItem');
  });

  afterEach(() => {
    setItemSpy.calls.reset();
    getItemSpy.calls.reset();
    removeItemSpy.calls.reset();
    httpSpy.post.calls.reset();
  });

  it('login: stores token, username, role and numeric id', (done) => {
    const payload: LoginRequest = { username: 'u', password: 'p' };
    const response: AuthResponse = {
      token: 'T',
      username: 'u',
      role: 'ROLE_USER',
      id: 99,
    };
    httpSpy.post.and.returnValue(of(response));

    service.login(payload).subscribe((res) => {
      expect(res).toEqual(response);
      expect(httpSpy.post).toHaveBeenCalledWith(`${baseUrl}/login`, payload);
      expect(setItemSpy).toHaveBeenCalledWith('auth_token', 'T');
      expect(setItemSpy).toHaveBeenCalledWith('auth_user', 'u');
      expect(setItemSpy).toHaveBeenCalledWith('auth_role', 'ROLE_USER');
      expect(setItemSpy).toHaveBeenCalledWith('auth_user_id', '99');
      done();
    });
  });

  it('login: does not store id if id is missing', (done) => {
    const payload: LoginRequest = { username: 'u2', password: 'p2' };
    const response: AuthResponse = { token: 't2', username: 'u2', role: 'ROLE_X' };
    httpSpy.post.and.returnValue(of(response));

    service.login(payload).subscribe(() => {
      expect(setItemSpy).toHaveBeenCalledWith('auth_token', 't2');
      expect(setItemSpy).toHaveBeenCalledWith('auth_user', 'u2');
      expect(setItemSpy).toHaveBeenCalledWith('auth_role', 'ROLE_X');
      // id should not be written
      expect(setItemSpy).not.toHaveBeenCalledWith('auth_user_id', jasmine.any(String));
      done();
    });
  });

  it('register: posts to /register and returns the registered user', (done) => {
    const payload: RegisterRequest = {
      name: 'A',
      firstLastname: 'B',
      secondLastname: 'C',
      email: 'e@e.com',
      username: 'u3',
      password: 'p3',
      rut: '12345678-9',
      role: '',
    };
    const user: RegisteredUser = {
      id: 1,
      name: 'A',
      firstLastname: 'B',
      secondLastname: 'C',
      email: 'e@e.com',
      username: 'u3',
      rut: '12345678-9',
      role: '',
    };
    httpSpy.post.and.returnValue(of(user));

    service.register(payload).subscribe((res) => {
      expect(httpSpy.post).toHaveBeenCalledWith(`${baseUrl}/register`, payload);
      expect(res).toEqual(user);
      done();
    });
  });

  it('logout: removes all localStorage keys', () => {
    service.logout();
    expect(removeItemSpy).toHaveBeenCalledWith('auth_token');
    expect(removeItemSpy).toHaveBeenCalledWith('auth_user');
    expect(removeItemSpy).toHaveBeenCalledWith('auth_role');
    expect(removeItemSpy).toHaveBeenCalledWith('auth_user_id');
  });

  it('getToken/getUsername/getRole return stored values or null', () => {
    getItemSpy.and.callFake((k: string) => {
      let value: string | null = null;
      if (k === 'auth_token') {
        value = 'TK';
      } else if (k === 'auth_user') {
        value = 'USR';
      } else if (k === 'auth_role') {
        value = 'R';
      }
      return value;
    });

    expect(service.getToken()).toBe('TK');
    expect(service.getUsername()).toBe('USR');
    expect(service.getRole()).toBe('R');

    // when key missing
    getItemSpy.and.returnValue(null);
    expect(service.getToken()).toBeNull();
    expect(service.getUsername()).toBeNull();
    expect(service.getRole()).toBeNull();
  });

  it('getUserId returns null for missing, null for NaN, numeric when valid', () => {
    // missing -> null
    getItemSpy.and.returnValue(null);
    expect(service.getUserId()).toBeNull();

    // invalid number -> null
    getItemSpy.and.returnValue('notanumber');
    expect(service.getUserId()).toBeNull();

    // valid number -> number
    getItemSpy.and.returnValue('42');
    expect(service.getUserId()).toBe(42);
  });

  it('hasRole normalizes and compares correctly', () => {
    // exact match ignoring ROLE_ prefix/casing/whitespace
    getItemSpy.and.returnValue(' role_admin ');
    expect(service.hasRole('ROLE_admin')).toBeTrue();

    // mismatch
    getItemSpy.and.returnValue('ROLE_USER');
    expect(service.hasRole('admin')).toBeFalse();

    // null role -> false
    getItemSpy.and.returnValue(null);
    expect(service.hasRole('ADMIN')).toBeFalse();
  });

  it('isAuthenticated returns true when token exists', () => {
    getItemSpy.and.returnValue('exists');
    expect(service.isAuthenticated()).toBeTrue();

    getItemSpy.and.returnValue(null);
    expect(service.isAuthenticated()).toBeFalse();
  });
});
