import { Component, inject, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductFilters } from '../../../products/interfaces/product.interface';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-right-navbar',
  imports: [ReactiveFormsModule],
  templateUrl: './right-navbar.html',
})
export class RightNavbar {

  filtersChange = output<Partial<ProductFilters>>();
  private fb = inject(FormBuilder);

  form = this.fb.group({
    gender: this.fb.nonNullable.control<string[]>([]),
    category: this.fb.nonNullable.control<string[]>([]),
    brand: this.fb.nonNullable.control<string[]>([]),
    minPrice: [null],
    maxPrice: [null],
  });

  constructor() {
    this.form.valueChanges
      .pipe(debounceTime(200))
      .subscribe(values => {
        this.filtersChange.emit(values);
      });
  }

  toggleArray(control: 'gender' | 'category' | 'brand', value: string) {
    const current = this.form.controls[control].value;

    this.form.controls[control].setValue(
      current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
    );
  }
}
