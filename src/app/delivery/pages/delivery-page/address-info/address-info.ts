import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryService } from '../../../services/delivery.service';
import { document_types } from '../personal-info-form/personal-info-form';
import { FormUtils } from '../../../../utils/form-utils';

@Component({
  selector: 'app-address-info',
  imports: [ReactiveFormsModule],
  templateUrl: './address-info.html',
})
export class AddressInfo {
  constructor(){
    console.log(this.departamentos());
  }
  private fb = inject(FormBuilder);
  private citiesService=inject(DeliveryService)
  departamentos=this.citiesService.departamentos;
  addressInfoSent = signal(false);
  addressInfo = this.fb.group({
    Departamento: ['', [Validators.required]],
    Municipio: ['', [Validators.required]],
    barrio: [''],
    calle: ['', [Validators.minLength(3), Validators.required]],
    complemento: [''],
    phoneNumber: [''],
  });
   formUtils = new FormUtils(this.addressInfo);
  onSave(){

  }
}
