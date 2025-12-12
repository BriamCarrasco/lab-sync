import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LaboratoriesService, Laboratory } from './laboratories';
import { HttpClient } from '@angular/common/http';

describe('LaboratoriesService', () => {
  let service: LaboratoriesService;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  const base = 'http://localhost:8082/api/laboratories';

  beforeEach(() => {
    httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpSpy }, LaboratoriesService],
    });

    service = TestBed.inject(LaboratoriesService);
  });

  it('getAll llama a http.get con la URL base y devuelve los laboratorios', (done) => {
    const labs: Laboratory[] = [
      { id: 1, name: 'L1', address: 'A1', specialty: 'S1', phone: 'p1', email: 'e1' },
      { id: 2, name: 'L2', address: 'A2', specialty: 'S2', phone: 'p2', email: 'e2' },
    ];
    httpSpy.get.and.returnValue(of(labs));

    service.getAll().subscribe((res) => {
      expect(httpSpy.get).toHaveBeenCalledWith(base);
      expect(res).toEqual(labs);
      done();
    });
  });

  it('getById llama a http.get con la URL correcta', (done) => {
    const lab: Laboratory = {
      id: 3,
      name: 'L3',
      address: 'A3',
      specialty: 'S3',
      phone: 'p3',
      email: 'e3',
    };
    httpSpy.get.and.returnValue(of(lab));

    service.getById(3).subscribe((res) => {
      expect(httpSpy.get).toHaveBeenCalledWith(`${base}/3`);
      expect(res).toEqual(lab);
      done();
    });
  });

  it('create hace post y devuelve el laboratorio creado', (done) => {
    const newLab = {
      name: 'New',
      address: 'Addr',
      specialty: 'Spec',
      phone: '123',
      email: 'a@b.com',
    };
    const created: Laboratory = { id: 10, ...newLab };
    httpSpy.post.and.returnValue(of(created));

    service.create(newLab).subscribe((res) => {
      expect(httpSpy.post).toHaveBeenCalledWith(base, newLab);
      expect(res).toEqual(created);
      done();
    });
  });

  it('create propaga error cuando http.post falla', (done) => {
    const newLab = {
      name: 'New',
      address: 'Addr',
      specialty: 'Spec',
      phone: '123',
      email: 'a@b.com',
    };
    const err = new Error('post failed');
    httpSpy.post.and.returnValue(throwError(() => err));

    service.create(newLab).subscribe({
      next: () => fail('No debe emiter next'),
      error: (e) => {
        expect(e).toBe(err);
        done();
      },
    });
  });

  it('update hace put con la URL correcta y el body', (done) => {
    const lab: Laboratory = {
      id: 5,
      name: 'Up',
      address: 'A',
      specialty: 'S',
      phone: 'p',
      email: 'e',
    };
    httpSpy.put.and.returnValue(of(lab));

    service.update(5, lab).subscribe((res) => {
      expect(httpSpy.put).toHaveBeenCalledWith(`${base}/5`, lab);
      expect(res).toEqual(lab);
      done();
    });
  });

  it('delete llama a http.delete con la URL correcta y devuelve void', (done) => {
    httpSpy.delete.and.returnValue(of(void 0));

    service.delete(7).subscribe((res) => {
      expect(httpSpy.delete).toHaveBeenCalledWith(`${base}/7`);
      expect(res).toBeUndefined();
      done();
    });
  });

  it('searchByName llama a la ruta /name/{name} y devuelve resultados', (done) => {
    const result: Laboratory[] = [
      { id: 20, name: 'X', address: 'A', specialty: 'Spec', phone: '', email: '' },
    ];
    httpSpy.get.and.returnValue(of(result));

    service.searchByName('X').subscribe((res) => {
      expect(httpSpy.get).toHaveBeenCalledWith(`${base}/name/X`);
      expect(res).toEqual(result);
      done();
    });
  });

  it('searchBySpecialty llama a la ruta /specialty/{specialty} y devuelve resultados', (done) => {
    const result: Laboratory[] = [
      { id: 21, name: 'Y', address: 'A', specialty: 'Cardio', phone: '', email: '' },
    ];
    httpSpy.get.and.returnValue(of(result));

    service.searchBySpecialty('Cardio').subscribe((res) => {
      expect(httpSpy.get).toHaveBeenCalledWith(`${base}/specialty/Cardio`);
      expect(res).toEqual(result);
      done();
    });
  });
});
