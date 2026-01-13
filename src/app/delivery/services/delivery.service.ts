import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { City, Departamento } from '../interfaces/cities.interface';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class DeliveryService {
  constructor() {
    this.getDepartamentos();
  }
  private baseUrlCities='https://api-colombia.com/api/v1';
  private http=inject(HttpClient);
  departamentos=signal<Departamento[]>([]);
  cities=signal<City[]>([]);

  getDepartamentos(){
    const url=`${this.baseUrlCities}/Department`;
    return this.http.get<Departamento[]>(url).subscribe(result=>{
      this.departamentos.set(result);
    });
  }
}
