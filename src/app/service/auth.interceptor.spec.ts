import { HttpRequest, HttpHeaders, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('forwards request unchanged when no token in localStorage', (done) => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    const req = new HttpRequest('GET', '/test');
    const next = jasmine
      .createSpy('next')
      .and.callFake((r: HttpRequest<any>) =>
        of(new HttpResponse({ body: null, headers: r.headers }))
      );

    authInterceptor(req, next).subscribe((event) => {
      const res = event as HttpResponse<any>;
      expect(next).toHaveBeenCalledWith(req);
      expect(res.headers.get('Authorization')).toBeNull();
      done();
    });
  });

  it('does not modify request when token is empty string', (done) => {
    spyOn(localStorage, 'getItem').and.returnValue('');
    const req = new HttpRequest('POST', '/test', { body: { ok: true } } as any);
    const next = jasmine
      .createSpy('next')
      .and.callFake((r: HttpRequest<any>) =>
        of(new HttpResponse({ body: null, headers: r.headers }))
      );

    authInterceptor(req, next).subscribe((event) => {
      const res = event as HttpResponse<any>;
      expect(next).toHaveBeenCalledWith(req);
      expect(res.headers.get('Authorization')).toBeNull();
      done();
    });
  });

  it('adds Authorization header when token exists', (done) => {
    spyOn(localStorage, 'getItem').and.returnValue('abc123');
    const req = new HttpRequest('GET', '/secure');
    const next = jasmine
      .createSpy('next')
      .and.callFake((r: HttpRequest<any>) =>
        of(new HttpResponse({ body: null, headers: r.headers }))
      );

    authInterceptor(req, next).subscribe((event) => {
      const res = event as HttpResponse<any>;
      expect(next).toHaveBeenCalled();
      const calledWith = next.calls.mostRecent().args[0] as HttpRequest<any>;
      expect(calledWith.headers.get('Authorization')).toBe('Bearer abc123');
      expect(res.headers.get('Authorization')).toBe('Bearer abc123');
      done();
    });
  });

  it('overwrites existing Authorization header with Bearer <token>', (done) => {
    spyOn(localStorage, 'getItem').and.returnValue('tokXYZ');
    const headers = new HttpHeaders({ Authorization: 'OldValue' });
    const req = new HttpRequest('GET', '/secure', { headers } as any);
    const next = jasmine
      .createSpy('next')
      .and.callFake((r: HttpRequest<any>) =>
        of(new HttpResponse({ body: null, headers: r.headers }))
      );

    authInterceptor(req, next).subscribe((event) => {
      const res = event as HttpResponse<any>;
      const calledWith = next.calls.mostRecent().args[0] as HttpRequest<any>;
      expect(calledWith.headers.get('Authorization')).toBe('Bearer tokXYZ');
      expect(res.headers.get('Authorization')).toBe('Bearer tokXYZ');
      done();
    });
  });
});
