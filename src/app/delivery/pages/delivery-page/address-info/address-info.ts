import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryService } from '../../../services/delivery.service';
import { FormUtils } from '../../../../utils/form-utils';
import { TitleCasePipe } from '@angular/common';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs';
import { City } from '../../../interfaces/cities.interface';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-address-info',
  imports: [ReactiveFormsModule],
  templateUrl: './address-info.html',
})
export class AddressInfo {

  constructor(){
    effect(()=>{
      if(this.addressStatus()==='VALID'){
        this.citiesService.formAddressValid.set(true);
      }else{
        this.citiesService.formAddressValid.set(false);
      }
    })
  }

  private fb = inject(FormBuilder);
  private citiesService = inject(DeliveryService);

  addressInfoSent = signal<boolean>(false);

  departamentoName = this.citiesService.selectedDepartamento;
  departamentos = this.citiesService.departamentos;

  personalInfoSent = this.citiesService.personalInfoSent;
  personalInfoDeployed = this.citiesService.personalInfoDeployed;
  addresInfoDeployed = this.citiesService.addressInfoDeployed;

  cities = signal<City[]>([]);

  addressInfo = this.fb.group({
    departamento: ['', [Validators.required]],
    municipio: ['', [Validators.required]],
    barrio: [''],
    calle: [''],
    complemento: [''],
    phoneNumber: [''],
  });

  addressStatus=toSignal(this.addressInfo.statusChanges,{initialValue:this.addressInfo.status})
  formUtils = new FormUtils(this.addressInfo);

  onFormChanged = effect((onCleanup) => {
    const sub = this.onDepartamentoChanged();
    onCleanup(() => sub?.unsubscribe());
  });

  onDepartamentoChanged() {
    return this.addressInfo
      .get('departamento')!
      .valueChanges.pipe(
        tap(() => {
          this.cities.set([]);
          this.addressInfo.get('municipio')!.setValue('', { emitEvent: false });
        }),
        filter((departamento): departamento is string => !!departamento),
        distinctUntilChanged(),
        switchMap((departamento) => this.citiesService.getMunicipiosByDeptId(departamento))
      )
      .subscribe((cities) => {
        this.cities.set(cities);
      });
  }

  onSave() {
    if (this.addressInfo.invalid) {
      this.addressInfo.markAllAsTouched();
      return;
    }
    this.addressInfoSent.set(true);
    this.citiesService.saveNext();
  }

  onEdit(state: boolean) {
    this.citiesService.setPersonalInfoDeployed(false);
    this.citiesService.setAddressInfoDeployed(true);
  }


}
