import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../../utils/form-utils';
import { DeliveryService } from '../../../services/delivery.service';
import { TitleCasePipe } from '@angular/common';
import { PhoneSpacesPipe } from '../../../../products/pipes/phone-pipe.pipe';
import { Navbar } from '../../../../share/components/navbar/navbar';
import { ShoppingSummary } from '../../../../shopping/pages/shopping-summary/shopping-summary';
import { toSignal } from '@angular/core/rxjs-interop';
import { Customer } from '../../../../orders/interfaces/order.interface';
import { zip } from 'rxjs';

export const document_types = [
  'Cédula de ciudadanía',
  'Cédula de extranjería',
  'NIT',
  'Pasaporte',
] as const;
export type DocumentType = (typeof document_types)[number];
const EMAIL_REGEX =
  /^(?=.{6,254}$)(?=.{1,64}@)[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

@Component({
  selector: 'app-personal-info-form',
  imports: [PhoneSpacesPipe, TitleCasePipe, ReactiveFormsModule],
  templateUrl: './personal-info-form.html',
})
export class PersonalInfoForm {
  constructor() {
    effect(() => {
      const customer = this.citiesService.personalInfoFormFilled();
      if (!customer) return;

      this.personalInfoForm.patchValue(
        {
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          docType: customer.tipDoc,
          nit: customer.numDoc,
          phoneNumber: customer.phoneNumber,
        },
        { emitEvent: false }
      );
      this.personalInfoForm.updateValueAndValidity({ emitEvent: true });
    });
  }

  private fb = inject(FormBuilder);
  private citiesService = inject(DeliveryService);
  persInfoSent = signal(false);
  bandera = signal(true);
  personalInfoDeployed = this.citiesService.personalInfoDeployed;
  addressInforDeployed = this.citiesService.addressInfoDeployed;
  finishForm = this.citiesService.finishForms;
  clicOnEdit = signal(false);
  docTypes = document_types;
  fullName = computed(() => {
    const first = this.personalInfoForm.get('firstName')?.value ?? '';
    const last = this.personalInfoForm.get('lastName')?.value ?? '';
    return `${first} ${last}`.trim();
  });
  customer = this.citiesService.personalInfoFormFilled;

  phone = computed(() => this.personalInfoForm.get('phoneNumber')?.value ?? '');
  email = computed(() => this.personalInfoForm.get('email')?.value ?? '');
  personalInfoForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
    firstName: ['', [Validators.minLength(3), Validators.required]],
    lastName: ['', [Validators.minLength(3), Validators.required]],
    docType: this.fb.control<DocumentType | null>(null, { validators: Validators.required }),
    nit: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^\d+$/)]],
    phoneNumber: ['', [Validators.minLength(3), Validators.required]],
  });

  personalInfoStatus = toSignal(this.personalInfoForm.statusChanges, {
    initialValue: this.personalInfoForm.status,
  });

  formUtils = new FormUtils(this.personalInfoForm);

  personalInfoValue = toSignal(this.personalInfoForm.valueChanges, {
    initialValue: this.personalInfoForm.getRawValue(),
  });
  personalInfoFilled = computed<Customer>(() => {
    const values = this.personalInfoValue();
    return {
      email: values.email ?? '',
      firstName: values.firstName ?? '',
      lastName: values.lastName ?? '',
      tipDoc: values.docType ?? null,
      numDoc: values.nit ?? '',
      phoneNumber: values.phoneNumber ?? '',
    };
  });

  onSave() {
    if (this.personalInfoForm.invalid) {
      this.personalInfoForm.markAllAsTouched();
      return;
    }

    const raw = this.personalInfoForm.getRawValue();

    this.citiesService.personalInfoFormFilled.set({
      email: raw.email?.trim() ?? '',
      firstName: raw.firstName ?? '',
      lastName: raw.lastName ?? '',
      tipDoc: raw.docType ?? null,
      numDoc: raw.nit ?? '',
      phoneNumber: raw.phoneNumber ?? '',
    });

    this.citiesService.writePersonalInfo();

    // ✅ AQUÍ está la clave
    this.citiesService.setPersonalInfoValidity(true);

    this.persInfoSent.set(true);
    this.onEdit(true);
  }

  onEdit(state: boolean) {

    this.citiesService.setAddressValidity(false);

    this.citiesService.setAddressInfoDeployed(state);
    this.citiesService.finishForms.set(false);
  }
}
