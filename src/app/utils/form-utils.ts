import { inject } from '@angular/core';
import {
  AbstractControl,
  Form,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validator,
} from '@angular/forms';

async function sleep(){
  return new Promise(resolve=>{
    setTimeout(() => {
      resolve(true);
    }, 2500);
  })
}

export class FormUtils {
  static namePattern = '^([a-zA-Z]+) ([a-zA-Z]+)$';
  static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  static notOnlySpacesPattern = '^[a-zA-Z0-9]+$';

  private myForm: FormGroup;

  constructor(form: FormGroup) {
    this.myForm = form;
  }

  isValidField(fieldName: string): boolean | null {
    if (fieldName === 'passwordNotEqual') {
      const touched = this.myForm.get('confirmPassword')?.touched ?? false;
      return this.myForm.hasError('passwordNotEqual') && touched;
    }

    const control = this.myForm.get(fieldName);
    if (!control) return null;
    return control.invalid && control.touched;
  }

  getTextErrors(errors: ValidationErrors, pattern?: string) {
    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido';
        case 'minlength':
          return `Mínimo de ${errors['minlength'].requiredLength} caracteres`;
        case 'pattern':
          switch (pattern) {
            case 'email':
              return 'Digite un corre electronico válido';
            case 'phoneNumber':
              return 'Digite solo números';
            case 'nit':
              return 'Digite solo números';
            default:
              return 'El campo no es válido';
          }
      }
    }
    return '';
  }

  getFieldError(fieldName: string, pattern?: string): string | null {
    const control = this.myForm.get(fieldName);
    if (!control || !control.errors) return null;
    const errors = this.myForm.controls[fieldName].errors ?? {};
    return this.getTextErrors(errors, pattern);
  }

}
