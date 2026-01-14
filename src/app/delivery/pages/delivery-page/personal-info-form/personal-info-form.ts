import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../../utils/form-utils';
import { DeliveryService } from '../../../services/delivery.service';
import { TitleCasePipe } from '@angular/common';
import { PhoneSpacesPipe } from '../../../../products/pipes/phone-pipe.pipe';
import { Navbar } from '../../../../share/components/navbar/navbar';
import { ShoppingSummary } from '../../../../shopping/pages/shopping-summary/shopping-summary';

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

  phone = computed(() => this.personalInfoForm.get('phoneNumber')?.value ?? '');
  email = computed(() => this.personalInfoForm.get('email')?.value ?? '');
  personalInfoForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_REGEX)]],
    firstName: ['', [Validators.minLength(3), Validators.required]],
    lastName: ['', [Validators.minLength(3), Validators.required]],
    docType: this.fb.control<DocumentType | null>(null, { validators: Validators.required }),
    nit: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^\d+$/)]],
    phoneNumber: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^\d+$/)]],
  });

  formUtils = new FormUtils(this.personalInfoForm);

  onSave() {
    console.log('Clic onSave');
    if (this.personalInfoForm.invalid) {
      this.personalInfoForm.markAllAsTouched();
      return;
    }
    this.persInfoSent.set(true);
    this.onEdit(true);
  }

  onEdit(state: boolean) {
    console.log('Ingresa');
    this.citiesService.setAddressInfoDeployed(state);
    this.citiesService.finishForms.set(false);
  }
}
