import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { City, Departamento } from '../interfaces/cities.interface';
import { finalize, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  constructor() {
    this.getDepartamentos();
    effect(() => {
      console.log('PersonalInfoDeployed-servicio->', this.personalInfoDeployed());
    });
  }

  /* CONFIGURACION DE CACHE */
  private readonly VERSION = 'v1';
  private readonly KEY_DEPTS = `co:departamentos:${this.VERSION}`;
  private cityKey = (deptId: string) => `co:cities:${deptId}:${this.VERSION}`;

  private citiesInFlight = new Map<string, Observable<City[]>>();

  private baseUrlCities = 'https://api-colombia.com/api/v1';
  private http = inject(HttpClient);
  selectedDepartamento = signal('');
  departamentos = signal<Departamento[]>([]);
  cities = signal<City[]>([]);
  personalInfoSent = signal(false);
  personalInfoDeployed = signal(true);
  addressInfoDeployed = signal(false);
  finishForms = signal(false);

  setPersonalInfoDeployed(change: boolean) {
    console.log('xxxx');
    this.personalInfoDeployed.set(change);
    console.log('Nuevo valor->', this.personalInfoDeployed());
  }
  setAddressInfoDeployed(change: boolean) {
    console.log('xxxx');
    this.addressInfoDeployed.set(change);
    console.log('Nuevo valor->', this.personalInfoDeployed());
  }

  saveNext() {
    console.log('save next');
    this.personalInfoDeployed.set(false);
    this.addressInfoDeployed.set(false);
    this.finishForms.set(true);
  }

  private readCache<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { version: string; fetchedAt: number; data: T };
      return parsed?.data ?? null;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }

  private writeCache<T>(key: string, data: T) {
    const envelope = { version: this.VERSION, fetchedAt: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(envelope));
  }

  getDepartamentos() {
    // 1) Cache
    const cached = this.readCache<Departamento[]>(this.KEY_DEPTS);
    if (cached?.length) {
      this.departamentos.set(cached);
      return;
    }

    // 2) API
    const url = `${this.baseUrlCities}/Department`;
    this.http
      .get<Departamento[]>(url)
      .pipe(
        map((items) => items.map((d) => ({ id: d.id, name: d.name }))), // normaliza
        tap((items) => this.writeCache(this.KEY_DEPTS, items))
      )
      .subscribe((result) => {
        this.departamentos.set(result);
      });
  }

  getMunicipiosByDeptId(deptId: string): Observable<City[]> {
    // actualiza nombre del depto seleccionado (si ya tienes departamentos cargados)
    const deptName = this.departamentos().find(x => x.id === Number(deptId))?.name;
    if (deptName) this.selectedDepartamento.set(deptName);

    // 1) Cache por deptId
    const key = this.cityKey(deptId);
    const cached = this.readCache<City[]>(key);
    if (cached?.length) {
      return of(cached);
    }

    // 2) Evitar duplicar request si ya está en vuelo
    const existing = this.citiesInFlight.get(deptId);
    if (existing) return existing;

    // 3) API
    const url = `${this.baseUrlCities}/department/${deptId}/cities`;

    const req$ = this.http.get<City[]>(url).pipe(
      map(items =>
        items.map(c => ({
          id: c.id,
          name: c.name,
          departmentId: String(c.departmentId ?? deptId),
        }))
      ),
      tap(items => this.writeCache(key, items)),
      shareReplay(1),
      finalize(() => this.citiesInFlight.delete(deptId))
    );

    this.citiesInFlight.set(deptId, req$);
    return req$;
  }
}
