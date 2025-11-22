import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../model/User';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly base = 'http://localhost:8081/users';

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  getByUsername(username: string): Observable<User | undefined> {
    return this.getAll().pipe(
      map((users) => {
        return (
          users.find((u: any) => u.userName === username) ||
          users.find((u: any) => u.username === username) ||
          users.find(
            (u: any) => (u.userName || u.username || '').toLowerCase() === username.toLowerCase()
          )
        );
      })
    );
  }

  update(id: number, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, user);
  }

  changePassword(id: number, oldPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/password`, {
      oldPassword,
      newPassword,
    });
  }
}
