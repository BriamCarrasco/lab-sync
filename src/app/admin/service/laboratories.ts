import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Laboratory {
  id: number;
  name: string;
  address: string;
  specialty: string;
  phone: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class LaboratoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8082/api/laboratories';

  getAll(): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(this.baseUrl);
  }

  getById(id: number): Observable<Laboratory> {
    return this.http.get<Laboratory>(`${this.baseUrl}/${id}`);
  }

  create(lab: Omit<Laboratory, 'id'>): Observable<Laboratory> {
    return this.http.post<Laboratory>(this.baseUrl, lab);
  }

  update(id: number, lab: Laboratory): Observable<Laboratory> {
    return this.http.put<Laboratory>(`${this.baseUrl}/${id}`, lab);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  searchByName(name: string): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(`${this.baseUrl}/name/${name}`);
  }

  searchBySpecialty(specialty: string): Observable<Laboratory[]> {
    return this.http.get<Laboratory[]>(`${this.baseUrl}/specialty/${specialty}`);
  }
}
