import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { UserService } from './UserService';
import { User } from '../model/User';

describe('UserService', () => {
  let service: UserService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'put', 'patch']);
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpSpy }, UserService],
    });
    service = TestBed.inject(UserService);
  });

  it('getAll calls http.get with base url', (done) => {
    const users: User[] = [
      {
        id: 1,
        username: 'a',
        name: '',
        firstLastname: '',
        secondLastname: '',
        email: '',
        rut: '',
        role: '',
        userName: '',
      },
    ];
    httpSpy.get.and.returnValue(of(users));
    service.getAll().subscribe((res) => {
      expect(httpSpy.get).toHaveBeenCalledWith('http://localhost:8081/users');
      expect(res).toEqual(users);
      done();
    });
  });

  it('getById calls http.get with id', (done) => {
    const user: User = {
      id: 2,
      username: 'b',
      name: '',
      firstLastname: '',
      secondLastname: '',
      email: '',
      rut: '',
      role: '',
      userName: '',
    };
    httpSpy.get.and.returnValue(of(user));
    service.getById(2).subscribe((res) => {
      expect(httpSpy.get).toHaveBeenCalledWith('http://localhost:8081/users/2');
      expect(res).toEqual(user);
      done();
    });
  });

  describe('getByUsername', () => {
    it('finds by userName', (done) => {
      const users: User[] = [
        {
          id: 1,
          userName: 'alpha',
          username: '',
          name: '',
          firstLastname: '',
          secondLastname: '',
          email: '',
          rut: '',
          role: '',
        },
        {
          id: 2,
          username: 'beta',
          userName: '',
          name: '',
          firstLastname: '',
          secondLastname: '',
          email: '',
          rut: '',
          role: '',
        },
      ];
      spyOn(service, 'getAll').and.returnValue(of(users));
      service.getByUsername('alpha').subscribe((res) => {
        expect(res).toEqual(users[0]);
        done();
      });
    });

    it('finds by username', (done) => {
      const users: User[] = [
        {
          id: 1,
          userName: 'alpha',
          username: '',
          name: '',
          firstLastname: '',
          secondLastname: '',
          email: '',
          rut: '',
          role: '',
        },
        {
          id: 2,
          username: 'beta',
          userName: '',
          name: '',
          firstLastname: '',
          secondLastname: '',
          email: '',
          rut: '',
          role: '',
        },
      ];
      spyOn(service, 'getAll').and.returnValue(of(users));
      service.getByUsername('beta').subscribe((res) => {
        expect(res).toEqual(users[1]);
        done();
      });
    });

    it('finds by case-insensitive match', (done) => {
      const users: User[] = [
        {
          id: 1,
          userName: 'alpha',
          username: '',
          name: '',
          firstLastname: '',
          secondLastname: '',
          email: '',
          rut: '',
          role: '',
        },
        {
          id: 2,
          username: 'beta',
          userName: '',
          name: '',
          firstLastname: '',
          secondLastname: '',
          email: '',
          rut: '',
          role: '',
        },
      ];
      spyOn(service, 'getAll').and.returnValue(of(users));
      service.getByUsername('ALPHA').subscribe((res) => {
        expect(res).toEqual(users[0]);
        done();
      });
    });

    it('returns undefined if not found', (done) => {
      const users: User[] = [
        {
          id: 1,
          userName: 'alpha',
          username: '',
          name: '',
          firstLastname: '',
          secondLastname: '',
          email: '',
          rut: '',
          role: '',
        },
        {
          id: 2,
          username: 'beta',
          userName: '',
          name: '',
          firstLastname: '',
          secondLastname: '',
          email: '',
          rut: '',
          role: '',
        },
      ];
      spyOn(service, 'getAll').and.returnValue(of(users));
      service.getByUsername('gamma').subscribe((res) => {
        expect(res).toBeUndefined();
        done();
      });
    });

    it('handles missing userName/username fields', (done) => {
      const users: User[] = [
        {
          id: 1,
          userName: '',
          username: '',
          name: '',
          firstLastname: '',
          secondLastname: '',
          email: '',
          rut: '',
          role: '',
        },
        {
          id: 2,
          username: 'beta',
          userName: '',
          name: '',
          firstLastname: '',
          secondLastname: '',
          email: '',
          rut: '',
          role: '',
        },
      ];
      spyOn(service, 'getAll').and.returnValue(of(users));
      service.getByUsername('beta').subscribe((res) => {
        expect(res).toEqual(users[1]);
        done();
      });
    });
  });

  it('update calls http.put with correct url and body', (done) => {
    const user: Partial<User> = { username: 'new' };
    const updated: User = {
      id: 3,
      username: 'new',
      userName: '',
      name: '',
      firstLastname: '',
      secondLastname: '',
      email: '',
      rut: '',
      role: '',
    };
    httpSpy.put.and.returnValue(of(updated));
    service.update(3, user).subscribe((res) => {
      expect(httpSpy.put).toHaveBeenCalledWith('http://localhost:8081/users/3', user);
      expect(res).toEqual(updated);
      done();
    });
  });

  it('changePassword calls http.patch with correct url and body', (done) => {
    httpSpy.patch.and.returnValue(of(undefined));
    service.changePassword(4, 'old', 'new').subscribe((res) => {
      expect(httpSpy.patch).toHaveBeenCalledWith('http://localhost:8081/users/4/password', {
        oldPassword: 'old',
        newPassword: 'new',
      });
      expect(res).toBeUndefined();
      done();
    });
  });
});
