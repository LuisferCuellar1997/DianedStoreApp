import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryService } from '../../../services/delivery.service';
import { FormUtils } from '../../../../utils/form-utils';
import { TitleCasePipe } from '@angular/common';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs';
import { City } from '../../../interfaces/cities.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { Address, Customer } from '../../../../orders/interfaces/order.interface';

@Component({
  selector: 'app-address-info',
  imports: [ReactiveFormsModule],
  templateUrl: './address-info.html',
})
export class AddressInfo {
  constructor() {
    effect(() => {
      const address = this.citiesService.addresInfoFormFilled();
      if (!address?.departamento) return;

      const deptId =
        this.citiesService.departamentos().find((d) => d.name === address.departamento)?.id ?? null;

      this.addressInfo.patchValue(
        {
          departamento: deptId,
          barrio: address.barrio,
          calle: address.calle,
          complemento: address.complemento,
        },
        { emitEvent: false }
      );

      if (deptId) {
        this.citiesService.getMunicipiosByDeptId(String(deptId)).subscribe((cities) => {
          this.cities.set(cities);

          this.addressInfo.get('municipio')!.setValue(address.municipio ?? null, {
            emitEvent: false,
          });
        });
      }
    });

    effect(() => {
      this.citiesService.formAddressValid.set(this.addressStatus() === 'VALID');
    });
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
    departamento: this.fb.control<string | null>(null, Validators.required),
    municipio: this.fb.control<string | null>(null, Validators.required),
    barrio: [''],
    calle: [''],
    complemento: [''],
  });

  addressValue = toSignal(this.addressInfo.valueChanges, {
    initialValue: this.addressInfo.getRawValue(),
  });
  addressInfoFilled = computed<Address>(() => {
    const value = this.addressValue();
    return {
      departamento: value.departamento ?? '',
      municipio: value.municipio ?? '',
      barrio: value.barrio ?? '',
      calle: value.calle ?? '',
      complemento: value.complemento ?? '',
    };
  });

  addressStatus = toSignal(this.addressInfo.statusChanges, {
    initialValue: this.addressInfo.status,
  });
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
          this.addressInfo.get('municipio')!.setValue(null, { emitEvent: false });
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

      this.addressInfo.updateValueAndValidity({ emitEvent: true });

      this.citiesService.setAddressValidity(false);
      return;
    }
    const raw = this.addressInfo.getRawValue();

    const deptId = raw.departamento;
    const deptName =
      this.citiesService.departamentos().find((d) => String(d.id) === String(deptId))?.name ?? '';

    this.citiesService.addresInfoFormFilled.set({
      departamento: deptName,
      municipio: raw.municipio ?? '',
      barrio: raw.barrio ?? '',
      calle: raw.calle ?? '',
      complemento: raw.complemento ?? '',
    });
    this.citiesService.writeAddressInfo();

    this.citiesService.setAddressValidity(true);

    this.addressInfoSent.set(true);
    this.citiesService.saveNext();
  }

  onEdit(state: boolean) {
    this.citiesService.setPersonalInfoDeployed(false);
    this.citiesService.setAddressInfoDeployed(true);
  }
}
