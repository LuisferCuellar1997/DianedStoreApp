import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { City, Departamento } from '../interfaces/cities.interface';
import { finalize, map, Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { Address, Customer, Order } from '../../orders/interfaces/order.interface';

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  constructor() {
    this.getDepartamentos();
    this.hydratePersonalInfo();
    this.readAddressInfo();
  }

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
  formAddressValid = signal(false);
  formPersInfoValid = signal(false);
  personalInfoFormFilled = signal<Customer>({
    email: '',
    firstName: '',
    lastName: '',
    tipDoc: null,
    numDoc: '',
    phoneNumber: '',
  });
  addresInfoFormFilled = signal<Address>({
    departamento: '',
    municipio: '',
    barrio: '',
    calle: '',
    complemento: '',
  });
  deliveryFinished = signal(false);

  private hydratePersonalInfo() {
    const raw = localStorage.getItem('customerInfo');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Customer;
      this.personalInfoFormFilled.set(parsed);
    } catch {
      console.warn('customerInfo corrupto en localStorage');
    }
  }

  setPersonalInfoDeployed(change: boolean) {
    this.personalInfoDeployed.set(change);
  }
  setAddressInfoDeployed(change: boolean) {
    this.addressInfoDeployed.set(change);
  }

  saveNext() {
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
    const cached = this.readCache<Departamento[]>(this.KEY_DEPTS);
    if (cached?.length) {
      this.departamentos.set(cached);
      return;
    }


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
    const deptName = this.departamentos().find((x) => x.id === deptId)?.name;
    if (deptName) this.selectedDepartamento.set(deptName);

    const key = this.cityKey(deptId);
    const cached = this.readCache<City[]>(key);
    if (cached?.length) {
      return of(cached);
    }

    const existing = this.citiesInFlight.get(deptId);
    if (existing) return existing;

    const url = `${this.baseUrlCities}/department/${deptId}/cities`;

    const req$ = this.http.get<City[]>(url).pipe(
      map((items) =>
        items.map((c) => ({
          id: c.id,
          name: c.name,
          departmentId: String(c.departmentId ?? deptId),
        }))
      ),
      tap((items) => this.writeCache(key, items)),
      shareReplay(1),
      finalize(() => this.citiesInFlight.delete(deptId))
    );

    this.citiesInFlight.set(deptId, req$);
    return req$;
  }

  writePersonalInfo() {
    localStorage.setItem('customerInfo', JSON.stringify(this.personalInfoFormFilled()));
  }

  readPersonalInfo() {
    const raw = localStorage.getItem('customerInfo');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Customer;
      this.personalInfoFormFilled.set(parsed);
    } catch {
      console.warn('customerInfo corrupto en localStorage');
    }
  }

  writeAddressInfo() {
    localStorage.setItem('addressInfo', JSON.stringify(this.addresInfoFormFilled()));
  }

  readAddressInfo() {
    const raw = localStorage.getItem('addressInfo');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Address;
      this.addresInfoFormFilled.set({
        departamento: parsed.departamento ?? '',
        municipio: parsed.municipio ?? '',
        barrio: parsed.barrio ?? '',
        calle: parsed.calle ?? '',
        complemento: parsed.complemento ?? '',
      });
    } catch {
      console.warn('customerInfo corrupto en localStorage');
    }
  }

  setPersonalInfoValidity(valid: boolean) {
    this.formPersInfoValid.set(valid);
  }

  setAddressValidity(valid: boolean) {
    this.formAddressValid.set(valid);
  }

  resetCheckout(options?: { keepPrefill?: boolean }) {
    this.deliveryFinished.set(false);

    this.personalInfoDeployed.set(true);
    this.addressInfoDeployed.set(false);
    this.finishForms.set(false);

    const customer = this.personalInfoFormFilled();
    const address = this.addresInfoFormFilled();

    const hasCustomer =
      !!customer.email &&
      !!customer.firstName &&
      !!customer.lastName &&
      !!customer.tipDoc &&
      !!customer.numDoc &&
      !!customer.phoneNumber;

    const hasAddress = !!address.departamento && !!address.municipio;

    this.formPersInfoValid.set(hasCustomer);
    this.formAddressValid.set(hasAddress);

    if (options?.keepPrefill === false) {
      this.personalInfoFormFilled.set({
        email: '',
        firstName: '',
        lastName: '',
        tipDoc: null,
        numDoc: '',
        phoneNumber: '',
      });

      this.addresInfoFormFilled.set({
        departamento: '',
        municipio: '',
        barrio: '',
        calle: '',
        complemento: '',
      });

      localStorage.removeItem('customerInfo');
      localStorage.removeItem('addressInfo');

      this.formPersInfoValid.set(false);
      this.formAddressValid.set(false);
    }
  }
}
