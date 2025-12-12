import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UsersService } from './users';
import { HttpClient } from '@angular/common/http';

describe('UsersService (admin)', () => {
  let service: UsersService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpSpy }, UsersService],
    });

    service = TestBed.inject(UsersService);
  });

  it('getAll debe llamar a http.get con la URL base y devolver usuarios', (done) => {
    const users = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ] as any[];
    httpSpy.get.and.returnValue(of(users));

    service.getAll().subscribe((res) => {
      expect(httpSpy.get).toHaveBeenCalledWith('http://localhost:8081/users');
      expect(res).toEqual(users);
      done();
    });
  });

  it('getById debe llamar a http.get con la URL correcta', (done) => {
    const user = { id: 3, name: 'C' } as any;
    httpSpy.get.and.returnValue(of(user));

    service.getById(3).subscribe((res) => {
      expect(httpSpy.get).toHaveBeenCalledWith('http://localhost:8081/users/3');
      expect(res).toEqual(user);
      done();
    });
  });

  it('update debe llamar a http.put con la URL e incluir el body', (done) => {
    const user = { id: 4, name: 'D' } as any;
    httpSpy.put.and.returnValue(of(user));

    service.update(user).subscribe((res) => {
      expect(httpSpy.put).toHaveBeenCalledWith('http://localhost:8081/users/4', user);
      expect(res).toEqual(user);
      done();
    });
  });

  it('delete debe llamar a http.delete con la URL correcta', (done) => {
    httpSpy.delete.and.returnValue(of(void 0));

    service.delete(7).subscribe((res) => {
      expect(httpSpy.delete).toHaveBeenCalledWith('http://localhost:8081/users/7');
      expect(res).toBeUndefined();
      done();
    });
  });

  it('create debe postear a /auth/register y mapear RegisteredUser a User (role presente)', (done) => {
    const payload = {
      name: 'Nuevo',
      firstLastname: 'F',
      secondLastname: 'S',
      email: 'n@x.com',
      username: 'nuevo',
      password: 'pw',
      rut: '12345678-9',
      role: 'admin',
    };

    const registeredResponse = {
      id: 55,
      name: payload.name,
      firstLastname: payload.firstLastname,
      secondLastname: payload.secondLastname,
      email: payload.email,
      username: payload.username,
      rut: payload.rut,
      role: payload.role,
    };

    httpSpy.post.and.returnValue(of(registeredResponse as any));

    service.create(payload as any).subscribe((res) => {
      expect(httpSpy.post).toHaveBeenCalledWith('http://localhost:8081/auth/register', {
        name: payload.name,
        firstLastname: payload.firstLastname,
        secondLastname: payload.secondLastname,
        email: payload.email,
        username: payload.username,
        password: payload.password,
        rut: payload.rut,
        role: payload.role || '',
      });
      // mapping: debe devolver el objeto User con las propiedades esperadas
      expect(res).toEqual({
        id: registeredResponse.id,
        name: registeredResponse.name,
        firstLastname: registeredResponse.firstLastname,
        secondLastname: registeredResponse.secondLastname,
        email: registeredResponse.email,
        username: registeredResponse.username,
        rut: registeredResponse.rut,
        role: registeredResponse.role,
      } as any);
      done();
    });
  });

  it('create debe enviar role vacío cuando no se provee y propagar error si falla', (done) => {
    const payloadNoRole = {
      name: 'NoRole',
      firstLastname: 'F',
      secondLastname: 'S',
      email: 'nr@x.com',
      username: 'norole',
      password: 'pw',
      rut: '87654321-0',
      // role omitido
    };

    // comprobar payload enviado al post
    httpSpy.post.and.returnValue(
      of({
        id: 77,
        name: payloadNoRole.name,
        firstLastname: payloadNoRole.firstLastname,
        secondLastname: payloadNoRole.secondLastname,
        email: payloadNoRole.email,
        username: payloadNoRole.username,
        rut: payloadNoRole.rut,
        role: '', // backend puede devolver '' o lo que corresponda; aquí comprobamos llamada
      } as any)
    );

    service.create(payloadNoRole as any).subscribe((res) => {
      expect(httpSpy.post).toHaveBeenCalledWith('http://localhost:8081/auth/register', {
        name: payloadNoRole.name,
        firstLastname: payloadNoRole.firstLastname,
        secondLastname: payloadNoRole.secondLastname,
        email: payloadNoRole.email,
        username: payloadNoRole.username,
        password: payloadNoRole.password,
        rut: payloadNoRole.rut,
        role: '', // se espera role ''
      });
      expect(res.id).toBeDefined();
      done();
    });
  });

  it('create debe propagar error cuando http.post falla', (done) => {
    const payload = {
      name: 'Err',
      firstLastname: 'F',
      secondLastname: 'S',
      email: 'e@x.com',
      username: 'err',
      password: 'pw',
      rut: '11111111-1',
    };

    const err = new Error('post failed');
    httpSpy.post.and.returnValue(throwError(() => err));

    service.create(payload as any).subscribe({
      next: () => {
        // no debe entrar aquí
        fail('Se esperaba error');
      },
      error: (e) => {
        expect(e).toBe(err);
        done();
      },
    });
  });
});
